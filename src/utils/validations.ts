import { Response,Request,NextFunction } from "express";
import { CustomError } from "./CustomError";
import { Status } from "./enums";



const nameRegex = /^[a-zA-Z]{3,20}(?: [a-zA-Z]+)*$/;
const emailRegex =
  /^(?=.{11,100}$)([a-zA-Z\d]+([.-_]?[a-zA-Z\d]+)*)\@([a-zA-Z]{4,9})+\.com$/;
const mobileNumberRegex = /^\d{10}$/;

const errorMessage = (field: string): string => `${field} is required`;

const throwRequiredError = (
  field: string,
  statusCode: Status
): never => {
  throw new CustomError(errorMessage(field), statusCode, field);
};

const isEmpty = (value: string, field: string) => {
    if (!value || value.trim() === "") {
      throwRequiredError(field, Status.BAD_REQUEST);
    }
  };
const validateName = (name: string): void => {
    isEmpty(name, "name");
    name = name.trim();
  
    if (name.length < 3) {
      throw new CustomError(
        "Name must be at least 3 characters long.",
         Status.BAD_REQUEST,
        "name"
      );
    }

    if (!nameRegex.test(name)) {
        throw new CustomError(
          "Invalid name format.",
          Status.BAD_REQUEST,
          "name"
        );
      }
    };

    const validateEmail = (email: string): void => {
        isEmpty(email, "email");
        email = email.trim();
      
        if (!emailRegex.test(email)) {
          throw new CustomError(
            "Invalid email address.",
            Status.BAD_REQUEST,
            "email"
          );
        }
      };

      const validatePassword = (password: string): void => {
        isEmpty(password, "password");
      
        type IPassword = { [key: string]: RegExp };
        const regex: IPassword = {
          "upper case": /[A-Z]/,
          "lower Case": /[a-z]/,
          number: /\d/,
          "special char": /[-/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\]/,
          length: /^.{6,20}$/,
        };
      
        for (let criteria in regex) {
          const regExpexpression = regex[criteria as keyof IPassword];
          if (!regExpexpression.test(password)) {
            throw new CustomError(
              `at least one ${errorMessage(criteria)}`,
              Status.BAD_REQUEST,
              "password"
            );
          }
        }
      };

  
const validatePhone = (phone: string): void => {
  isEmpty(phone, "phone");
  phone = phone.trim();

  if (!mobileNumberRegex.test(phone)) {
    throw new CustomError(
      "Phone number must be 10 digits.",
      Status.BAD_REQUEST,
      "phone"
    );
  }
};

const validateDOB = (dob: string): void => {
  isEmpty(dob, "dob");
  dob = dob.trim();

  const dobRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
  
  if (!dobRegex.test(dob)) {
    throw new CustomError(
      "Invalid DOB format. Use YYYY-MM-DD.",
      Status.BAD_REQUEST,
      "dob"
    );
  }
};

const validateAddress = (address: string): void => {
  if (!address || address.trim() === "") return; // Address is optional

  if (address.length < 5) {
    throw new CustomError(
      "Address must be at least 5 characters long.",
      Status.BAD_REQUEST,
      "address"
    );
  }
};

const validateGender = (gender: string): void => {
  if (!["male", "female", "other", ""].includes(gender.toLowerCase())) {
    throw new CustomError(
      "Invalid gender. Must be 'male', 'female', or 'other'.",
      Status.BAD_REQUEST,
      "gender"
    );
  }
};

      export {
        validateName,
        validateEmail,
        validatePassword,
        validatePhone,
        validateDOB,
        validateAddress,
        validateGender
      }



