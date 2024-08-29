import fs from "fs"

 export const removeTemp = (path)=>{
    fs.unlink(path,err=>{
        if(err) throw err
    })
}