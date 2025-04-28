export const getUserProgress=(data: Record<string, string>[] | undefined,studentNumber:string)=>{
    if(data && data.length!==0){
        const target = data.find((item)=>item["学籍番号"]===studentNumber)
        if(target){
        return target
        }
    }
    return {};
}
