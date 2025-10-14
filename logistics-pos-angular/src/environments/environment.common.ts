import { environment } from "./environment"

const baseURL = `${environment.baseURL + 'api/'}`

export const environmentCommon = {
    api: {
        login: {
            LOGIN: baseURL + 'login',
            REFRESH: baseURL + 'refresh',
            REGISTER: baseURL + 'register',
            LOGIN_VERIFY: baseURL + 'login/verify/email',
            VERIFY_OTP: baseURL + 'verify/otp',
            FORGOT_PASSWORD: baseURL + 'forgot/password',
            CHANGE_PASSWORD: baseURL + 'change/password',
            RESET_PASSWORD: baseURL + 'reset/password',
        },
        supplier: {
            CATEGORY: baseURL + 'product/category'
        },
        order: {
            ORDER_TYPE: baseURL + 'order/type',
            CUSTOMER: baseURL + 'customer'
        }
    }
}
