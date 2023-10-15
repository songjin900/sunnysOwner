import {withIronSessionApiRoute, withIronSessionSsr} from "iron-session/next"

declare module "iron-session" {
    interface IronSessionData {
        admin?:{
            id: number;
        },
    }
}

const cookieOptions = {
    cookieName: "sunnysAdminsession",
    password: process.env.COOKIE_PASSWORD!
}

export function withApiSession(fn:any){
    return withIronSessionApiRoute(fn, cookieOptions)
}

export function withSsrSession(handler:any) {
  return withIronSessionSsr(handler, cookieOptions);
}