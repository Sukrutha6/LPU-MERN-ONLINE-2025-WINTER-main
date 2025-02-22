const generateOTP=()=>{
    const x= Math.random();
    const fourDigitDecimalNumber= x*9000+1000;
    const forurDigitNum= Math.floor(fourDigitDecimalNumber);
    return forurDigitNum;
};
module.exports={
    generateOTP,
} 