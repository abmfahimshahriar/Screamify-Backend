const isEmail = (email: string) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

const isEmpty = (str: string) => {
  if (str.trim() == "") return true;
  else return false;
};

const validateSignupData = (data: any) => {
  let errors: any = {};

  // email validation
  if (isEmpty(data.email)) errors.email = "Must not be empty";
  else if (!isEmail(data.email)) errors.email = "Must be a valid email";

  // password validation
  if (isEmpty(data.password)) errors.password = "Must not be empty";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(data.handle)) errors.handle = "Must not be empty";
  return {
    errors,
    valid: Object.keys(errors).length > 0 ? false :true,
  };
};

const validateLoginData = (data: any) => {
  let errors: any = {};

  // email validation
  if (isEmpty(data.email)) errors.email = "Must not be empty";
  else if (!isEmail(data.email)) errors.email = "Must be a valid email";
  // password validation
  if (isEmpty(data.password)) errors.password = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length > 0 ? false: true,
  };
};

export { isEmail, isEmpty, validateSignupData, validateLoginData };
