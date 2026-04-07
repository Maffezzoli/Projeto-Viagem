Somente TokenAuth/CaptchaResolver devem conhecer fluxo JWT + captcha + token final.
Módulos de domínio só pedem token_auth.authenticate().