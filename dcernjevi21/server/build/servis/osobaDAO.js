import Baza from "../zajednicko/sqliteBaza.js";
export class OsobaDAO {
    baza;
    constructor() {
        this.baza = new Baza("podaci/RWA2024dcernjevi21_servis.sqlite");
    }
    dodaj(osoba, poznatPo) {
        console.log("Osoba ID koja se dodaje u bazu:" + osoba.id);
        //this.baza.spojiSeNaBazu();
        try {
            let sql = `INSERT INTO osoba (osoba_id, ime_prezime, poznat_po, popularnost, profilna_slika) VALUES (?,?,?,?,?)`;
            let podaci = [
                osoba.id,
                osoba.name,
                poznatPo,
                osoba.popularity,
                osoba.profile_path,
            ];
            this.baza.ubaciAzurirajPodatke(sql, podaci);
            //this.baza.zatvoriVezu();
        }
        catch (err) {
            console.log("vec postoji ista osoba");
            return;
        }
    }
    async dajOsobePoStranicama(stranica) {
        let sql = "SELECT osoba_id as id, ime_prezime as name, popularnost as popularity, profilna_slika as profile_path, poznat_po as known_for FROM osoba LIMIT 20 OFFSET ?";
        let offset;
        let rezultat = new Array();
        if (stranica == 0) {
            offset = 0;
        }
        else {
            offset = stranica * 20 - 20;
        }
        var podaci = (await this.baza.dajPodatkePromise(sql, [
            offset,
        ]));
        for (let p of podaci) {
            let k = {
                id: p["id"],
                name: p["name"],
                known_for: p["known_for"],
                popularity: p["popularity"],
                profile_path: p["profile_path"],
            };
            rezultat.push(k);
        }
        return rezultat;
    }
    async pronadiOsobu(id) {
        let sql = "SELECT osoba_id AS id, ime_prezime AS name, poznat_po AS known_for, popularnost AS popularity, profilna_slika AS profile_path FROM osoba WHERE osoba_id=?";
        var podaci = (await this.baza.dajPodatkePromise(sql, [
            id,
        ]));
        if (podaci.length == 1 && podaci[0] != undefined) {
            let p = podaci[0];
            let k = {
                id: p["id"],
                name: p["name"],
                known_for: p["known_for"],
                popularity: p["popularity"],
                profile_path: p["profile_path"],
            };
            return k;
        }
        return null;
    }
    obrisiOsobu(id) {
        let sql = "DELETE FROM osoba WHERE osoba_id=?";
        this.baza.ubaciAzurirajPodatke(sql, [id]);
        return true;
    }
    obrisiOsobuISveVezeNaFilmove(id) {
        const sql = "DELETE FROM osobaFilm WHERE osoba_id = ?";
        const sql2 = "DELETE FROM osoba WHERE osoba_id=?";
        try {
            this.baza.ubaciAzurirajPodatke(sql, [id]);
            console.log(`uspjesno obrisana osoba.`);
            this.baza.ubaciAzurirajPodatke(sql2, [id]);
            console.log(`uspjesno obrisani povezani filmovi.`);
            return true;
        }
        catch (error) {
            console.error("Greška pri povezivanju osoba i filmova u bazu:", error);
            return false;
        }
    }
    nista() {
        return "bok";
    }
}
