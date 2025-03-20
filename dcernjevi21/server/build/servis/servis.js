import cors from "cors";
import express from "express";
import path from "path";
import { dajPort } from "../zajednicko/esmPomocnik.js";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";
import { RestKorisnik } from "./restKorisnik.js";
import { RestTMDB } from "./restTMDB.js";
import { ServisDAO } from "./servisDAO.js";
import { __dirname } from "../zajednicko/esmPomocnik.js";
import { HtmlUpravitelj } from "./htmlUpravitelj.js";
import { KorisnikDAO } from "./korisnikDAO.js";
//import session from "express-session";
const server = express();
const putanja = __dirname();
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(cors({
    origin: function (origin, povratniPoziv) {
        console.log(origin);
        if (!origin ||
            origin.startsWith("http://spider.foi.hr:") ||
            origin.startsWith("http://localhost:")) {
            povratniPoziv(null, true);
        }
        else {
            povratniPoziv(new Error("Nije dozvoljeno zbog CORS"));
        }
    },
    optionsSuccessStatus: 200,
}));
let port = dajPort("dcernjevi21");
let konf = new Konfiguracija();
konf
    .ucitajKonfiguraciju()
    .then(pokreniKonfiguraciju)
    .catch((greska) => {
    console.log(greska.message);
    process.exit();
});
/*
server.use(
  session({
    secret: konf.dajKonf().tajniKljucSesija,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: Number(konf.dajKonf().jwtValjanost) * 1000 * 60,
      httpOnly: false,
      sameSite: "lax",
      secure: false,
    },
  })
);*/
function pokreniKonfiguraciju() {
    pripremiPutanjeAutentifikacija();
    pripremiPutanjeResursKorisnika();
    pripremiPutanjeResursTMDB();
    server.post("/servis/app/makniPravo/:korime", (zahtjev, odgovor) => {
        let servisDao = new ServisDAO();
        servisDao.makniPrava(zahtjev.params["korime"]);
        odgovor.end();
    });
    server.post("/servis/app/dajPravo/:korime", (zahtjev, odgovor) => {
        let servisDao = new ServisDAO();
        servisDao.dajPrava(zahtjev.params["korime"]);
        odgovor.end();
    });
    server.post("/servis/app/zatrazioPravo/:korime", (zahtjev, odgovor) => {
        let korisnikDao = new KorisnikDAO();
        korisnikDao.zatrazioPravo(zahtjev.params["korime"]);
        odgovor.end();
    });
    server.post("/servis/app/setPravo/:korime/:vrijednost", (zahtjev, odgovor) => {
        let korisnikDao = new KorisnikDAO();
        korisnikDao.oznaciPristupRest(zahtjev.params["korime"], Number(zahtjev.params["vrijednost"]));
        odgovor.end();
    });
    server.post("/servis/app/korisnici/2f/:korime/:vrijednost/:generirajTotp", async (zahtjev, odgovor) => {
        let korisnikDao = new KorisnikDAO();
        korisnikDao.azuriraj2fAutentifikaciju(zahtjev.params["korime"], Number(zahtjev.params["vrijednost"]), Number(zahtjev.params["generirajTotp"]));
        odgovor.send(JSON.stringify(await korisnikDao.dohvatiKorisnika(zahtjev.params["korime"])));
    });
    server.get("/servis/app/korisnici/2f/:korime", async (zahtjev, odgovor) => {
        let korisnikDao = new KorisnikDAO();
        odgovor.send(JSON.stringify(await korisnikDao.dohvatiKorisnika(zahtjev.params["korime"])));
    });
    server.get("/servis/app/korisnici/2f/totp/:username/:key", async (zahtjev, odgovor) => {
        let korisnikDao = new KorisnikDAO();
        let korisnik = (await korisnikDao.dohvatiKorisnika(zahtjev.params["username"]));
        let success = true;
        if (success) {
            odgovor.json(korisnik);
        }
        else {
            odgovor.status(405).end();
        }
    });
    server.post("/servis/app/checkRecaptcha", async (zahtjev, odgovor) => {
        const token = zahtjev.body.token;
        if (!token) {
            return odgovor.status(400).send({ message: "Token is missing" });
        }
        try {
            const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: konf.dajKonf().recaptchaTajniKljuc,
                    response: token,
                }),
            });
            const data = await response.json();
            console.log(data);
            if (data.success && data.score > 0.5) {
                odgovor.status(200).send(true).end();
                return true;
            }
            else {
                odgovor.status(400).send({ poruka: "Roboti nisu dozvoljeni" });
                return false;
            }
        }
        catch (error) {
            odgovor.status(500).send({ poruka: "Nepoznata greška" });
        }
    });
    server.use("/", express.static(path.join(putanja, "..", "..", "angular", "browser")));
    server.use((zahtjev, odgovor) => {
        odgovor.status(404);
        odgovor.json({ greska: "nepostojeći resurs" });
    });
    server.listen(port, () => {
        console.log(`Server pokrenut na portu: ${port}`);
    });
}
function pripremiPutanjeAutentifikacija() {
    let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc, port);
    //server.get("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
    server.post("/servis/app/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
    server.post("/prijava", htmlUpravitelj.postPrijava.bind(htmlUpravitelj));
    server.get("/servis/app/dodavanje", htmlUpravitelj.dohvatOsoba.bind(htmlUpravitelj));
    server.get("/odjava", htmlUpravitelj.odjava.bind(htmlUpravitelj));
}
function pripremiPutanjeResursTMDB() {
    let restTMDB = new RestTMDB(konf.dajKonf()["tmdbApiKeyV3"], konf.dajKonf()["jwtTajniKljuc"]);
    server.get("/servis/app/tmdb/images/:id", restTMDB.getPersonImages.bind(restTMDB));
    server.get("/servis/app/osoba", restTMDB.getOsobaStranica.bind(restTMDB));
    server.post("/servis/app/osoba", restTMDB.postOsobaStranica.bind(restTMDB));
    server.put("/servis/app/osoba", restTMDB.putOsobaStranica.bind(restTMDB));
    server.delete("/servis/app/osoba", restTMDB.deleteOsobaStranica.bind(restTMDB));
    server.get("/servis/app/osoba/:id", restTMDB.getOsobaJWT.bind(restTMDB));
    server.post("/servis/app/osoba/:id", restTMDB.postOsobaId.bind(restTMDB));
    server.put("/servis/app/osoba/:id", restTMDB.putOsobaId.bind(restTMDB));
    server.delete("/servis/app/osoba/:id", restTMDB.deleteOsobaId.bind(restTMDB));
    server.get("/servis/app/osoba/:id/film", restTMDB.getOsobaFilm.bind(restTMDB));
    server.post("/servis/app/osoba/:id/film", restTMDB.postOsobaFilm.bind(restTMDB));
    server.put("/servis/app/osoba/:id/film", restTMDB.putOsobaFilm.bind(restTMDB));
    server.delete("/servis/app/osoba/:id/film", restTMDB.deleteOsobaFilm.bind(restTMDB));
    server.get("/servis/app/film", restTMDB.getFilmStranica.bind(restTMDB));
    server.post("/servis/app/film", restTMDB.postFilmStranica.bind(restTMDB));
    server.put("/servis/app/film", restTMDB.putFilmStranica.bind(restTMDB));
    server.delete("/servis/app/film", restTMDB.deleteFilmStranica.bind(restTMDB));
    server.get("/servis/app/film/:id", restTMDB.getFilmJWTId.bind(restTMDB));
    server.post("/servis/app/film/:id", restTMDB.postFilmId.bind(restTMDB));
    server.put("/servis/app/film/:id", restTMDB.putFilmId.bind(restTMDB));
    server.delete("/servis/app/film/:id", restTMDB.deleteFilmId.bind(restTMDB));
    server.delete("/servis/app/film/brisanjeSvihNepovezanih", restTMDB.deleteFilmoveNepovezane.bind(restTMDB));
}
function pripremiPutanjeResursKorisnika() {
    let restKorisnik = new RestKorisnik();
    server.get("/servis/app/korisnici", restKorisnik.getKorisnici.bind(restKorisnik));
    server.post("/servis/app/korisnici", restKorisnik.postKorisnici.bind(restKorisnik));
    server.put("/servis/app/korisnici", restKorisnik.putKorisnici.bind(restKorisnik));
    server.delete("/servis/app/korisnici", restKorisnik.deleteKorisnici.bind(restKorisnik));
    server.get("/servis/app/korisnici/:korime", restKorisnik.getKorisnik.bind(restKorisnik));
    server.post("/servis/app/korisnici/:korime/prijava", restKorisnik.getKorisnikPrijava.bind(restKorisnik));
    server.post("/servis/app/korisnici/:korime", restKorisnik.postKorisnik.bind(restKorisnik));
    server.put("/servis/app/korisnici/:korime", restKorisnik.putKorisnik.bind(restKorisnik));
    server.delete("/servis/app/korisnici/:korime", restKorisnik.deleteKorisnik.bind(restKorisnik));
}
