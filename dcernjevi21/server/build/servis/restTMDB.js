import { TMDBklijent } from "./klijentTMDB.js";
import { FilmDAO } from "./filmDAO.js";
import * as jwt from "../zajednicko/jwt.js";
import { OsobaDAO } from "./osobaDAO.js";
export class RestTMDB {
    tmdbKlijent;
    tajniKljucJWT;
    filmDAO;
    osobaDAO;
    constructor(api_kljuc, tajniKljucJWT) {
        this.tmdbKlijent = new TMDBklijent(api_kljuc);
        this.filmDAO = new FilmDAO();
        this.osobaDAO = new OsobaDAO();
        this.tajniKljucJWT = tajniKljucJWT;
        console.log(api_kljuc);
    }
    //angular
    async getPersonImages(zahtjev, odgovor) {
        odgovor.type("application/json");
        console.log("PersonImages tu sam");
        const id = zahtjev.params["id"];
        if (!id || !Number(id)) {
            odgovor.status(422);
            odgovor.json({ greska: "neočekivani podaci" });
            return;
        }
        let images = await this.tmdbKlijent.dohvatiGalerijuSlikaPoId(Number(id));
        console.log("images nakon dohvata", images);
        odgovor.send(JSON.stringify(images));
    }
    async getOsobaStranica(zahtjev, odgovor) {
        odgovor.type("application/json");
        console.log("getOsobaStranica tu sam");
        const stranica = zahtjev.query["stranica"];
        if (!stranica || isNaN(Number(stranica))) {
            odgovor.status(422);
            odgovor.json({ greska: "neočekivani podaci" });
            return;
        }
        let success;
        const stranicaN = Number(stranica);
        success = await this.osobaDAO.dajOsobePoStranicama(stranicaN);
        if (success != undefined || success != null) {
            console.log(success);
            odgovor
                .status(200) //.send({ poruka: "odgovarajući podaci" });
                .send(JSON.stringify(success));
        }
        else {
            odgovor.status(400);
            let poruka = { greska: "ne postoje osobe u bazi podataka" };
            odgovor.send(poruka);
        }
    }
    //dodavanje osobe u bazu stranica=---ime---
    async postOsobaStranica(zahtjev, odgovor) {
        odgovor.type("application/json");
        console.log("postOsobaStranica tu sam");
        // Dohvaćanje query parametra `stranica`
        const stranica = zahtjev.query["stranica"];
        // Provjera je li `stranica` definirana
        if (!stranica || isNaN(Number(stranica))) {
            odgovor.status(400);
            odgovor.json({
                greska: "id nije valjan",
            });
            return;
        }
        // Pretvorba u broj za daljnju obradu
        const brojStranica = Number(stranica);
        console.log(`Stranica: ${brojStranica}`);
        let osoba = await this.tmdbKlijent.pretraziOsobePoId(brojStranica);
        let query = osoba.name;
        let osobaZaDodati = await this.tmdbKlijent.dohvatiOsobu(query);
        let filtriranaOsoba = osobaZaDodati.filter((osobaa) => osobaa.id === brojStranica);
        console.log(filtriranaOsoba[0]);
        if (filtriranaOsoba.length > 0) {
            console.log(filtriranaOsoba[0]); // Prikazivanje osobe
            const odabranaOsoba = filtriranaOsoba[0];
            const knownForMovies = filtriranaOsoba[0]?.known_for;
            // Provjera da li je known_for niz
            if (Array.isArray(knownForMovies)) {
                // Spajanje titlova u string odvojen zarezima
                const poznatPo = knownForMovies.map((movie) => movie.title).join(", ");
                console.log("Dodajem osobu u bazu:", osoba.name);
                this.osobaDAO.dodaj(odabranaOsoba, poznatPo);
                odgovor.status(201);
                odgovor.json({ status: "uspjeh" });
            }
            else {
                console.log("Nema filmova u 'known_for'.");
                odgovor.status(400).send({ greska: "Osoba nema relevantne podatke." });
            }
        }
        else {
            console.log("Osoba nije pronađena.");
            odgovor.status(400).send({ greska: "Osoba nije pronađena." });
        }
    }
    putOsobaStranica(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.json({ greska: "zabranjena metoda" });
    }
    deleteOsobaStranica(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.json({ greska: "zabranjena metoda" });
    }
    getOsobaJWT(zahtjev, odgovor) {
        /*if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
                odgovor.status(406);
                odgovor.json({ greska: "JWT nije prihvaćen" });
            } else {
                this.getOsobaId(zahtjev, odgovor);
            }*/
        this.getOsobaId(zahtjev, odgovor);
    }
    async getOsobaId(zahtjev, odgovor) {
        console.log(this);
        odgovor.type("application/json");
        const id = zahtjev.params["id"];
        if (id == null || typeof id != "string") {
            odgovor.status(422);
            odgovor.json({ greska: "neočekivani podaci" });
            return;
        }
        let osoba = await this.osobaDAO.pronadiOsobu(parseInt(id));
        console.log(osoba);
        if (osoba != null) {
            odgovor.status(200);
            odgovor.json(osoba);
        }
        else {
            odgovor.status(400);
            let poruka = { greska: "ne postoji tražena osoba u bazi" };
            odgovor.send(JSON.stringify(poruka));
        }
    }
    postOsobaId(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.json({ greska: "zabranjena metoda" });
    }
    putOsobaId(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.json({ greska: "zabranjena metoda" });
    }
    deleteOsobaId(zahtjev, odgovor) {
        odgovor.type("application/json");
        const id = zahtjev.params["id"];
        if (id == null || typeof id != "string") {
            odgovor.status(400);
            odgovor.send({
                greska: "ne postoji osoba u bazi kojoj id nije brojčana vrijednost",
            });
            return;
        }
        let success = this.osobaDAO.obrisiOsobuISveVezeNaFilmove(parseInt(id));
        if (success == true) {
            odgovor.status(201);
            odgovor.json({ status: "uspjeh" });
        }
        else {
            odgovor.status(400);
            odgovor.json({ greska: "filmovi postoje u bazi" });
        }
    }
    async getOsobaFilm(zahtjev, odgovor) {
        odgovor.type("application/json");
        const id = zahtjev.params["id"];
        const stranica = zahtjev.query["stranica"];
        if (!stranica || !id || isNaN(Number(stranica)) || isNaN(Number(id))) {
            odgovor.status(422);
            odgovor.json({ greska: "neočekivani podaci" });
            return;
        }
        const stranicaN = Number(stranica);
        let success = await this.filmDAO.dajfilmoveVezaneUzOsobuPoStranicama(parseInt(id), stranicaN);
        if (success != undefined || success != null) {
            console.log(success);
            odgovor.status(200);
            odgovor.send(success);
        }
        else {
            odgovor.status(400);
            let poruka = { greska: "ne postoji filmovi vezani uz datu osobu" };
            odgovor.send(JSON.stringify(poruka));
        }
    }
    postOsobaFilm(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.json({ greska: "zabranjena metoda" });
    }
    async putOsobaFilm(zahtjev, odgovor) {
        odgovor.type("application/json");
        console.log("putOsobaFilm tu sam");
        //privremeno riješenje
        const id = zahtjev.params["id"];
        if (!id || isNaN(Number(id))) {
            odgovor.status(422);
            odgovor.json({
                greska: "neočekivani podaci",
            });
            return;
        }
        const stranica = parseInt(id);
        console.log(stranica);
        let filmovi = await this.tmdbKlijent.dohvatiFilmovePoId(stranica);
        console.log(filmovi);
        let success = this.filmDAO.poveziOsobeIFilmove(filmovi, stranica);
        console.log(success);
        if (success == true) {
            odgovor.status(201);
            odgovor.json({ status: "uspjeh" });
        }
        else {
            odgovor.status(400);
            let poruka = { greska: "filmovi postoje u bazi" };
            odgovor.send(JSON.stringify(poruka));
        }
    }
    deleteOsobaFilm(zahtjev, odgovor) {
        odgovor.type("application/json");
        const osobaId = zahtjev.params["id"];
        let success = this.filmDAO.obrisiFilmPovezanOsobom(Number(osobaId));
        if (success == true) {
            odgovor.status(201);
            odgovor.json({ status: "uspjeh" });
        }
        else {
            odgovor.status(400);
            let poruka = { greska: "ne postoje filmovi povezani s tom osobom" };
            odgovor.send(JSON.stringify(poruka));
        }
    }
    async getFilmStranica(zahtjev, odgovor) {
        odgovor.type("application/json");
        console.log("getFilmStranica tu sam");
        const stranica = zahtjev.query["stranica"];
        const datumOd = zahtjev.query["datumOd"];
        const datumDo = zahtjev.query["datumDo"];
        if (!stranica) {
            console.log("podaciukurcu");
            odgovor.status(422);
            odgovor.json({ greska: "neočekivani podaci" });
            return;
        }
        let success;
        const stranicaN = Number(stranica);
        if (!datumOd && !datumDo) {
            success = await this.filmDAO.dajFilmovePoStranicama(stranicaN);
        }
        else {
            const datumOdN = Number(datumOd);
            const datumDoN = Number(datumDo);
            success = await this.filmDAO.dajFilmovePoStranicama(stranicaN, datumOdN, datumDoN);
        }
        console.log(success);
        if (success != undefined || success != null) {
            odgovor.status(200);
            odgovor.json(success);
        }
        else {
            odgovor.status(400);
            let poruka = { greska: "ne postoje filmovi u bazi podataka" };
            odgovor.send(JSON.stringify(poruka));
        }
    }
    async postFilmStranica(zahtjev, odgovor) {
        odgovor.type("application/json");
        console.log("postFilmStranica tu sam");
        // Dohvaćanje query parametra `stranica`
        const stranica = zahtjev.query["stranica"];
        if (!stranica || isNaN(Number(stranica))) {
            odgovor.status(400).send(JSON.stringify({
                greska: "Parametar 'stranica mora biti broj.",
            }));
            return;
        }
        const idOsobePoFilmu = Number(stranica);
        let filmovi = await this.tmdbKlijent.dohvatiFilmovePoId(idOsobePoFilmu);
        let success = this.filmDAO.dodajFilmove(filmovi);
        if (success == true || filmovi != undefined) {
            odgovor.status(201);
            odgovor.json({ status: "uspjeh" });
        }
        else {
            odgovor.status(400);
            let poruka = { greska: "filmovi postoje u bazi" };
            odgovor.send(JSON.stringify(poruka));
        }
    }
    putFilmStranica(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.json({ greska: "zabranjena metoda" });
    }
    deleteFilmStranica(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.json({ greska: "zabranjena metoda" });
    }
    getFilmoviJWT(zahtjev, odgovor) {
        if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
            odgovor.status(406);
            odgovor.json({ greska: "JWT nije prihvaćen" });
        }
        else {
            this.getFilmovi(zahtjev, odgovor);
        }
    }
    getFilmJWTId(zahtjev, odgovor) {
        /*if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
                odgovor.status(406);
                odgovor.json({ greska: "JWT nije prihvaćen" });
            } else {
                this.getFilm(zahtjev, odgovor);
            }*/
        this.getFilmId(zahtjev, odgovor);
    }
    getFilmId(zahtjev, odgovor) {
        console.log(this);
        odgovor.type("application/json");
        const id = zahtjev.params["id"];
        if (id == null || typeof id != "string") {
            odgovor.status(422);
            odgovor.json({ greska: "neočekivani podaci" });
            return;
        }
        this.tmdbKlijent
            .pretraziFilmovePoId(parseInt(id))
            .then((osoba) => {
            odgovor.send(osoba);
            odgovor.status(200);
        })
            .catch((greska) => {
            odgovor.json(greska);
        });
    }
    postFilmId(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.json({ greska: "zabranjena metoda" });
    }
    putFilmId(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.json({ greska: "zabranjena metoda" });
    }
    deleteFilmId(zahtjev, odgovor) {
        odgovor.type("application/json");
        console.log("doso sam u deleteFilmId:");
        const id = zahtjev.params["id"];
        if (id == null || typeof id != "string") {
            odgovor.status(400);
            odgovor.send({
                greska: "nije moguće izbrisati film jer film ne postoji u bazi podataka",
            });
            return;
        }
        let success = this.filmDAO.obrisiFilm(parseInt(id));
        if (success == true) {
            odgovor.status(201);
            odgovor.json({ status: "uspjeh" });
        }
        else {
            odgovor.status(400);
            let poruka = {
                greska: "nije moguce obrisati film jer je film povezan s jednom ili vise drugih osoba",
            };
            odgovor.send(JSON.stringify(poruka));
        }
    }
    deleteFilmoveNepovezane(zahtjev, odgovor) {
        odgovor.type("application/json");
        let success = this.filmDAO.obrisiFilmBezVeza();
        if (success == true) {
            //pogleda zake ne dojde do tuj
            odgovor.status(201);
            odgovor.json({ status: "uspjeh" });
        }
        else {
            odgovor.status(400);
            let poruka = { greska: "greska kod brisanja filma" };
            odgovor.send(JSON.stringify(poruka));
        }
    }
    getFilmovi(zahtjev, odgovor) {
        console.log(this);
        odgovor.type("application/json");
        let stranica = zahtjev.query["stranica"];
        let trazi = zahtjev.query["trazi"];
        if (stranica == null ||
            trazi == null ||
            typeof stranica != "string" ||
            typeof trazi != "string") {
            odgovor.status(422);
            odgovor.json({ greska: "neočekivani podaci" });
            return;
        }
        this.tmdbKlijent
            .pretraziFilmovePoNazivu(trazi, parseInt(stranica))
            .then((filmovi) => {
            odgovor.send(filmovi);
        })
            .catch((greska) => {
            odgovor.json(greska);
        });
    }
}
