import jwt from "jsonwebtoken";
export function kreirajToken(korisnik, tajniKljucJWT) {
    let token = jwt.sign({ korime: korisnik.korime, tip_korisnika: korisnik.tip_korisnika }, tajniKljucJWT, {
        expiresIn: "300s",
    });
    //console.log(token);
    return token;
}
export function provjeriToken(zahtjev, tajniKljucJWT) {
    //	console.log("Provjera tokena: "+zahtjev.headers.authorization);
    if (zahtjev.headers.authorization != null) {
        console.log(zahtjev.headers.authorization);
        let token = zahtjev.headers.authorization.split(" ")[1] ?? "";
        console.log(token);
        try {
            let podaci = jwt.verify(token, tajniKljucJWT);
            //console.log("JWT podaci: "+podaci);
            return podaci;
        }
        catch (e) {
            //     console.log(e)
            return false;
        }
    }
    return false;
}
export function dajToken(zahtjev) {
    return zahtjev.headers.authorization;
}
export function ispisiDijelove(token) {
    let dijelovi = token.split(".");
    if (dijelovi[0] != undefined) {
        let zaglavlje = dekodirajBase64(dijelovi[0]);
        console.log(zaglavlje);
    }
    if (dijelovi[1] != undefined) {
        let tijelo = dekodirajBase64(dijelovi[1]);
        console.log(tijelo);
    }
    if (dijelovi[2] != undefined) {
        let potpis = dekodirajBase64(dijelovi[2]);
        console.log(potpis);
    }
}
export function dajTijelo(token) {
    let dijelovi = token.split(".");
    if (dijelovi[1] == undefined)
        return {};
    return JSON.parse(dekodirajBase64(dijelovi[1]));
}
export function dajZaglavlje(token) {
    let dijelovi = token.split(".");
    if (dijelovi[1] == undefined)
        return {};
    return JSON.parse(dekodirajBase64(dijelovi[1]));
}
function dekodirajBase64(data) {
    let buff = Buffer.from(data, "base64");
    return buff.toString("ascii");
}
