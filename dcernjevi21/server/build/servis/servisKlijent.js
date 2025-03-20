import os from "os";
import * as kodovi from "../zajednicko/kodovi.js";
export class ServisKlijent {
    portRest;
    constructor(portRest) {
        this.portRest = portRest;
    }
    async dodajKorisnika(korisnik) {
        let tijelo = {
            email: korisnik.email,
            korime: korisnik.korime,
            lozinka: kodovi.kreirajSHA256(korisnik.lozinka, "moja sol"),
            ime: korisnik.ime || null,
            prezime: korisnik.prezime || null,
            adresa: korisnik.adresa || null,
            telefon: korisnik.telefon || null,
            datum_rodenja: korisnik.datum_rodenja || null,
            tip_korisnika: "registrirani korisnik",
            aktivacijskiKod: -1,
        };
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        let parametri = {
            method: "POST",
            body: JSON.stringify(tijelo),
            headers: zaglavlje,
        };
        let odgovor = await fetch("http://" + os.hostname() + ":" + this.portRest + "/servis/korisnici", parametri);
        if (odgovor.status == 201) {
            console.log("Korisnik ubačen na servisu");
            return true;
        }
        else {
            console.log(odgovor.status);
            console.log(await odgovor.text());
            return false;
        }
    }
    async prijaviKorisnika(korime, lozinka) {
        console.log("u prijav korisnika");
        lozinka = kodovi.kreirajSHA256(lozinka, "moja sol");
        let tijelo = {
            lozinka: lozinka,
        };
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        let parametri = {
            method: "POST",
            body: JSON.stringify(tijelo),
            headers: zaglavlje,
        };
        let odgovor = await fetch("http://" +
            os.hostname() +
            ":" +
            this.portRest +
            "/servis/korisnici/" +
            korime +
            "/prijava", parametri);
        if (odgovor.status == 200) {
            var k = await odgovor.json();
            return k;
        }
        else {
            return false;
        }
    }
}
