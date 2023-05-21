import axios from "axios";
import { parse } from 'node-html-parser';
import { Hash } from "../lib/hash";
import { prisma } from "../lib/prisma";

// || Interfaces
interface ISimarInteruptions {
  tagetDate: Date
  information: string
  hash: string
}

console.info("Process started...")

// || Get Target Page HTML Content
const targetPage = "http://www.simar-louresodivelas.pt/divulgacao_pag/comunicados.aspx"

const fetchHtmlContent = async () => {
  const res = await axios.get(targetPage)
  return res.data
}

const parseHtmlToObject = async () => {
  const htmlContent = await fetchHtmlContent()
  return parse(htmlContent)
}

const extractInfoFromHtmlObject = async () => {
  const root = await parseHtmlToObject();
  let tableLines = Array.prototype.slice.call(root.getElementsByTagName("td"))

  tableLines = tableLines.filter(tableLine => {
    const content = tableLine.textContent.trim()

    if(content.length > 4 && content.includes("Interrupção")){
      return true
    }

    return false
  })

  let alertsInfoArray: Array<string> = tableLines[0].textContent.trim().split("\n")
  alertsInfoArray = alertsInfoArray.filter(alertInfo => alertInfo.trim().length > 4)

  let alertInfoFormatedArray: Array<ISimarInteruptions> = []

  alertsInfoArray.forEach((alertsInfo, index) => {
    alertsInfo = alertsInfo.trim()
    if(alertsInfo.includes("Interrupção")){
      let indexForward = 1
      while((new Date(alertsInfoArray[index + indexForward].trim())).toString().includes("Invalid")){
        indexForward++
      }
      const date = new Date(alertsInfoArray[index + indexForward].trim())
      const hash = Hash(alertsInfo.concat(date.toLocaleString()))
      alertInfoFormatedArray.push({tagetDate: date, information:alertsInfo, hash,})
  }
  })

  return alertInfoFormatedArray
}

const persistOrRefreshSimarAlertsOnDB = async () => {
  let totalData = 0
  let totalProcessed = 0

  const data = await extractInfoFromHtmlObject()

  if(!data.length){
    return
  }

  totalData=data.length

  const thisYear = (new Date()).getFullYear()
  const thisMonth = (new Date()).getMonth()

  data.forEach(async (alertData) => {

    if(
      alertData.tagetDate.getFullYear() !== thisYear || 
      alertData.tagetDate.getMonth() !== thisMonth
      ){
        return
      }
    
    const alertFromDb = await prisma.alerts.findUnique({
      where: {
        hash: alertData.hash
      }
    })

    if(alertFromDb){
      return
    }

    await prisma.alerts.create({
      data: {
        hash: alertData.hash,
        description: alertData.information,
        target_date: alertData.tagetDate
      }
    })

    totalProcessed++
  })

  console.log(`Exist total of ${totalData} from simar page, and was inserted on DB ${totalProcessed} entries`)
}

persistOrRefreshSimarAlertsOnDB()
console.info("Process finished")