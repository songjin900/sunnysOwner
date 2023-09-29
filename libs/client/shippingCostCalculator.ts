import nodemailer from "nodemailer";
import client from "@libs/server/client";

export const ShippingCostCalculator =  (totalCostBeforeTax: number) => {
    let shippingCost = 5;

    try{
        if (+totalCostBeforeTax <= 75){
            shippingCost = 5;
        }
        else {
            shippingCost = 0;
        }

        return shippingCost
    }
    catch (err: any){

    }
};
