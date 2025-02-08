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

      export {
        validateName,
        validateEmail,
        validatePassword
      }



