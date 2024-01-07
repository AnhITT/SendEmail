function responseReturn(res,status,sucess,data){
    res.send(status, {
        sucess: sucess,
        data: data
      });
}
module.exports={
    responseReturn:responseReturn,
}