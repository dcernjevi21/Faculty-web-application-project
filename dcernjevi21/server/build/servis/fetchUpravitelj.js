import * as jwt from "../zajednicko/jwt.js";
export class FetchUpravitelj {
    tajniKljucJWT;
    constructor(tajniKljucJWT) {
        this.tajniKljucJWT = tajniKljucJWT;
    }
    async getJWT(zahtjev, odgovor) {
        odgovor.type("json");
        let sesija = zahtjev.session;
        if (sesija["korime"] != null) {
            let k = { korime: sesija.korime, tip_korisnika: sesija.tip_korisnika_id };
            let noviToken = jwt.kreirajToken(k, this.tajniKljucJWT);
            odgovor.send({ ok: noviToken });
            return;
        }
        odgovor.status(401);
        odgovor.send({ greska: "nemam token!" });
    }
}
