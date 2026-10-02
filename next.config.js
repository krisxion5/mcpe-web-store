const h=[["X-Content-Type-Options","nosniff"],["X-Frame-Options","DENY"],["Referrer-Policy","strict-origin-when-cross-origin"],
["Strict-Transport-Security","max-age=63072000; includeSubDomains"],["Permissions-Policy","camera=(), microphone=(), geolocation=()"],
["Content-Security-Policy","default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"+(process.env.NODE_ENV==="production"?"":" 'unsafe-eval'")+"; frame-ancestors 'none'"]];
module.exports={poweredByHeader:false,async headers(){return[{source:"/(.*)",headers:h.map(([key,value])=>({key,value}))}]}};
