import otpGenerator from 'otp-generator'

const generateOtp = ():string => {
    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });
    return OTP
  };
  
  
  export{
    generateOtp
  }