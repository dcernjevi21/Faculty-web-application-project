import { __dirname } from "../zajednicko/esmPomocnik.js";
import ds from "fs/promises";
import { ServisKlijent } from "./servisKlijent.js";
import { Request, Response } from "express";
import { Session } from "express-session";
import { KorisnikI } from "src/servisI/korisniciI.js";
import { kreirajToken } from "../zajednicko/jwt.js";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";
import { KorisnikDAO } from "./korisnikDAO.js";

import { dajPort } from "../zajednicko/esmPomocnik.js";
import { TMDBklijent } from "./klijentTMDB.js";

export interface RWASession extends Session {
  korisnik: any;
  korime: string;
  tip_korisnika_id: number;
  tmdbKlijent: TMDBklijent;
}

export class HtmlUpravitelj {
  private tajniKljucJWT: string;
  private servisKlijent: ServisKlijent;
  private tmdbKlijent: TMDBklijent = new TMDBklijent(
    "8cdcbbd7937e391121a41381747a7cb5"
  );

  constructor(tajniKljucJWT: string, port: number) {
    this.tajniKljucJWT = tajniKljucJWT;
    console.log(this.tajniKljucJWT);
    this.servisKlijent = new ServisKlijent(dajPort("dcernjevi21"));
  }

  async dohvatOsoba(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    console.log("dosao u dodavanjeOsoba htmlupravitelj");

    let trazenje = (zahtjev.query["search"] as string) || "";
    let stranica = zahtjev.query["page"];

    let osobe = await this.tmdbKlijent.dohvatiOsobe(trazenje, Number(stranica));

    odgovor.send(JSON.stringify(osobe));
  }

  async registracija(zahtjev: Request, odgovor: Response) {
    console.log(zahtjev.body);
    let greska = "";
    if (zahtjev.method == "POST") {
      let uspjeh = await new KorisnikDAO().dodaj(zahtjev.body);
      if (uspjeh) {
        odgovor.status(200);
        odgovor.json({ status: "uspjeh" });
      } else {
        greska = "Dodavanje nije uspjelo provjerite podatke!";
        odgovor.send(JSON.stringify(greska));
      }
    }
    return;
  }

  async odjava(zahtjev: Request, odgovor: Response) {
    if (!zahtjev.session) {
      console.error("Sesija nije pronađena.");
      odgovor.status(400).send({ poruka: "Sesija nije aktivna." });
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        zahtjev.session.destroy((err) => {
          if (err) {
            console.error("Greška pri uništavanju sesije:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      console.log("Sesija uspješno uništena.");
      odgovor.redirect("/");
    } catch (err) {
      console.error("Greška tijekom odjave:", err);
      odgovor.status(500).json({ greska: "Greška tijekom odjave." });
    }
  }

  async postPrijava(zahtjev: Request, odgovor: Response) {
    if (zahtjev.method == "POST") {
      var korime = zahtjev.body.username;
      var lozinka = zahtjev.body.password;
      var k = await this.servisKlijent.prijaviKorisnika(korime, lozinka);
      if (k) var korisnik = k;
      else
        var korisnik: KorisnikI = {
          ime: "error",
          prezime: "error",
          korime: "error",
          email: "",
          lozinka: "",
          adresa: "",
          telefon: "",
          datum_rodenja: "",
          tip_korisnika_id: "1",
          ima_pristup: 0,
          zatrazio_pristup: 0,
          totp_tajniKljuc: "",
          two_factor: false,
        };
      if (korisnik) {
        let sesija = zahtjev.session as RWASession;
        sesija.korisnik = korisnik.ime + " " + korisnik.prezime;
        sesija.korime = korisnik.korime;
        sesija.tip_korisnika_id = parseInt(korisnik.tip_korisnika_id);
        console.log(sesija.tip_korisnika_id);
        console.log(korisnik.tip_korisnika_id);
        odgovor.send(JSON.stringify(korisnik));
        odgovor.redirect("/");
        return;
      } else {
        return;
      }
    }
    return;
  }

  async getJWT(zahtjev: Request, odgovor: Response) {
    let sesija = zahtjev.session as RWASession;
    if (sesija == null || !sesija.korisnik) {
      odgovor.status(401).send({ opis: "zabranjen pristup" });
      odgovor.end();
      return;
    }

    let konf = new Konfiguracija();
    try {
      let token = kreirajToken(
        {
          korime: sesija.korime,
          tip_korisnika: sesija.tip_korisnika_id,
        },
        konf.dajKonf().jwtTajniKljuc
      );
      odgovor.send(token);
    } catch (error) {
      odgovor.status(400).send({
        opis: `Greška kod stvaranja JWT-a: ${error}`,
      });
    }
  }

  async korisnici(zahtjev: Request, odgovor: Response) {
    let sesija = zahtjev.session as RWASession;
    console.log(
      "tip korisnika prilikom zahtjeva za spajanje na stranicu:",
      sesija.tip_korisnika_id
    );
    if (sesija.tip_korisnika_id != 1) {
      odgovor.status(403).send("Zabranjen pristup");
      return;
    }
    let stranica = await this.ucitajStranicu("korisnici");

    let korisnici = await new KorisnikDAO().dajSve();

    let temp = "";
    for (let korisnik of korisnici) {
      temp += `<tr> <td> ${korisnik.korime} </td> 
			<td> ${
        korisnik.korime != sesija.korime
          ? "<form action='/obrisi' method='POST'><input name='korime' hidden value=" +
            korisnik.korime +
            " /> <button> Brisanje korisnika </button></form>"
          : ""
      } </td>
			
			<td> ${
        korisnik.ima_pristup
          ? "<form action='/makniPristup' method='POST'><input name='korime' hidden value=" +
            korisnik.korime +
            " /> <button> Zabrani pristup </button> </form>"
          : korisnik.zatrazio_pristup
          ? "<form action='/dajPristup' method='POST'><input name='korime' hidden value=" +
            korisnik.korime +
            " /> <button> Daj pristup </button> </form>"
          : ""
      } </td>
			`;
    }
    stranica = stranica.replace("<tbody>", "<tbody>" + temp);

    odgovor.send(stranica);
  }

  private async ucitajStranicu(nazivStranice: string, poruka = "") {
    let stranice = [
      this.ucitajHTML(nazivStranice),
      this.ucitajHTML("navigacija"),
    ];
    let [stranica, nav] = await Promise.all(stranice);
    if (stranica != undefined && nav != undefined) {
      stranica = stranica.replace("#navigacija#", nav);
      stranica = stranica.replace("#poruka#", poruka);
      return stranica;
    }
    return "";
  }

  private ucitajHTML(htmlStranica: string) {
    return ds.readFile(
      __dirname() + "/html/" + htmlStranica + ".html",
      "utf-8"
    );
  }
}
