// Bound bytes while reading, including chunked bodies and multi-byte UTF-8.
export async function readBoundedText(request,limit,message='Request is too large.'){
 const tooLarge=()=>Object.assign(Error(message),{status:413});
 if(Number(request.headers.get('content-length'))>limit)throw tooLarge();
 if(!request.body)return '';
 const reader=request.body.getReader(),decoder=new TextDecoder();let bytes=0,text='';
 try{for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>limit){await reader.cancel().catch(()=>{});throw tooLarge();}text+=decoder.decode(value,{stream:true});}return text+decoder.decode();}
 finally{reader.releaseLock();}
}
