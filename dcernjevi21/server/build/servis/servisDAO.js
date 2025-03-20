import Baza from "../zajednicko/sqliteBaza.js";
export class ServisDAO {
    baza_servis;
    constructor() {
        this.baza_servis = new Baza("podaci/RWA2024dcernjevi21_servis.sqlite");
    }
    dajPrava(korime) {
        let sql = `INSERT INTO korisnik_s_dozvolom (korisnicko_ime) VALUES (?)`;
        console.log(korime);
        let podaci = [korime];
        this.baza_servis.ubaciAzurirajPodatke(sql, podaci);
    }
    makniPrava(korime) {
        let sql = "DELETE FROM korisnik_s_dozvolom WHERE korisnicko_ime=?";
        this.baza_servis.ubaciAzurirajPodatke(sql, [korime]);
    }
}
