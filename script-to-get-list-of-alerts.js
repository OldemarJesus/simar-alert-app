let contentsArr = []
    Array.prototype.slice.call(document.getElementsByTagName("td")).forEach(element=>{
    content = element.textContent.trim()
    if(content.length > 4 && content.includes("Interrupção")){
        var contentsArrStage1 = content.split("\n")
        var contentsArrStage2 = []
        contentsArrStage1.forEach((data, index) => {
            if(data.trim().length > 4) contentsArrStage2.push(data.trim())
        })

        contentsArrStage2.forEach((data, index)=>{
            if(data.includes("Interrupção")){
                var date = contentsArrStage2[index + 1]
                contentsArr.push(date.concat(" | ").concat(data))
            }
        })
    }
})
