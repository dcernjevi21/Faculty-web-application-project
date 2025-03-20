import { __dirname } from "../zajednicko/esmPomocnik.js";
import ds from "fs/promises";
import { ServisKlijent } from "./servisKlijent.js";
import { kreirajToken } from "../zajednicko/jwt.js";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";
import { KorisnikDAO } from "./korisnikDAO.js";
//import { TMDBklijent } from "./klijentTMDB.js";
import { dajPort } from "../zajednicko/esmPomocnik.js";
import { TMDBklijent } from "./klijentTMDB.js";
export class HtmlUpravitelj {
    tajniKljucJWT;
    servisKlijent;
    tmdbKlijent = new TMDBklijent("8cdcbbd7937e391121a41381747a7cb5");
    constructor(tajniKljucJWT, port) {
        this.tajniKljucJWT = tajniKljucJWT;
        console.log(this.tajniKljucJWT);
        this.servisKlijent = new ServisKlijent(dajPort("dcernjevi21"));
        //this.tmdbKlijent = new TMDBklijent("8cdcbbd7937e391121a41381747a7cb5");
    }
    /*async pocetna(zahtjev: Request, odgovor: Response) {
          let sesija = zahtjev.session as RWASession;
          let pocetna = await this.ucitajStranicu("pocetna");
          if (sesija.korime != null) {
              const korisnik = await new KorisnikDAO().daj(sesija.korime);
              pocetna = pocetna.replace(
                  "<main>",
                  `<main> <h3>Korisnik: ${korisnik?.korime}</h3> <br>
                          <h3>Email: ${korisnik?.email}</h3> <br>
                          <h3>Ime: ${korisnik?.ime ?? "-"}</h3>
                          <h3>Prezime: ${korisnik?.prezime ?? "-"}</h3> <br>
                          <h3>Ima pristup REST servisu: ${
                              korisnik?.ima_pristup ? "Ima" : "Nema"
                          }</h3> <br>
                          ${
                              korisnik?.ima_pristup == 0
                                  ? '<form action="/zatraziPristup" method="POST"><button> Zatraži pristup Rest servisu </button></form>'
                                  : ""
                          }`
              );
          }
  
          odgovor.cookie("port", this.port, { httpOnly: false });
          odgovor.send(pocetna);
      }*/
    async dohvatOsoba(zahtjev, odgovor) {
        odgovor.type("application/json");
        console.log("dosao u dodavanjeOsoba htmlupravitelj");
        let trazenje = zahtjev.query["search"] || "";
        let stranica = zahtjev.query["page"];
        let osobe = await this.tmdbKlijent.dohvatiOsobe(trazenje, Number(stranica));
        odgovor.send(JSON.stringify(osobe));
    }
    async registracija(zahtjev, odgovor) {
        console.log(zahtjev.body);
        let greska = "";
        if (zahtjev.method == "POST") {
            let uspjeh = await new KorisnikDAO().dodaj(zahtjev.body);
            if (uspjeh) {
                odgovor.status(200);
                odgovor.json({ status: "uspjeh" });
            }
            else {
                greska = "Dodavanje nije uspjelo provjerite podatke!";
                odgovor.send(JSON.stringify(greska));
            }
        }
        return;
    }
    async odjava(zahtjev, odgovor) {
        if (!zahtjev.session) {
            console.error("Sesija nije pronađena.");
            odgovor.status(400).send({ poruka: "Sesija nije aktivna." });
            return;
        }
        try {
            await new Promise((resolve, reject) => {
                zahtjev.session.destroy((err) => {
                    if (err) {
                        console.error("Greška pri uništavanju sesije:", err);
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
            console.log("Sesija uspješno uništena.");
            odgovor.redirect("/"); // Preusmjeravanje nakon uspješnog uništavanja
        }
        catch (err) {
            console.error("Greška tijekom odjave:", err);
            odgovor.status(500).json({ greska: "Greška tijekom odjave." });
        }
    }
    async postPrijava(zahtjev, odgovor) {
        if (zahtjev.method == "POST") {
            var korime = zahtjev.body.username;
            var lozinka = zahtjev.body.password;
            var k = await this.servisKlijent.prijaviKorisnika(korime, lozinka);
            if (k)
                var korisnik = k;
            else
                var korisnik = {
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
                let sesija = zahtjev.session;
                sesija.korisnik = korisnik.ime + " " + korisnik.prezime;
                sesija.korime = korisnik.korime;
                sesija.tip_korisnika_id = parseInt(korisnik.tip_korisnika_id);
                console.log(sesija.tip_korisnika_id);
                console.log(korisnik.tip_korisnika_id);
                odgovor.send(JSON.stringify(korisnik));
                odgovor.redirect("/");
                return;
            }
            else {
                return;
            }
        }
        return;
    }
    async getJWT(zahtjev, odgovor) {
        let sesija = zahtjev.session;
        if (sesija == null || !sesija.korisnik) {
            odgovor.status(401).send({ opis: "zabranjen pristup" });
            odgovor.end();
            return;
        }
        let konf = new Konfiguracija();
        try {
            let token = kreirajToken({
                korime: sesija.korime,
                tip_korisnika: sesija.tip_korisnika_id,
            }, konf.dajKonf().jwtTajniKljuc);
            odgovor.send(token);
        }
        catch (error) {
            odgovor.status(400).send({
                opis: `Greška kod stvaranja JWT-a: ${error}`,
            });
        }
    }
    async korisnici(zahtjev, odgovor) {
        let sesija = zahtjev.session;
        console.log("tip korisnika prilikom zahtjeva za spajanje na stranicu:", sesija.tip_korisnika_id);
        if (sesija.tip_korisnika_id != 1) {
            odgovor.status(403).send("Zabranjen pristup");
            return;
        }
        let stranica = await this.ucitajStranicu("korisnici");
        let korisnici = await new KorisnikDAO().dajSve();
        let temp = "";
        for (let korisnik of korisnici) {
            temp += `<tr> <td> ${korisnik.korime} </td> 
			<td> ${korisnik.korime != sesija.korime
                ? "<form action='/obrisi' method='POST'><input name='korime' hidden value=" +
                    korisnik.korime +
                    " /> <button> Brisanje korisnika </button></form>"
                : ""} </td>
			
			<td> ${korisnik.ima_pristup
                ? "<form action='/makniPristup' method='POST'><input name='korime' hidden value=" +
                    korisnik.korime +
                    " /> <button> Zabrani pristup </button> </form>"
                : korisnik.zatrazio_pristup
                    ? "<form action='/dajPristup' method='POST'><input name='korime' hidden value=" +
                        korisnik.korime +
                        " /> <button> Daj pristup </button> </form>"
                    : ""} </td>
			`;
        }
        stranica = stranica.replace("<tbody>", "<tbody>" + temp);
        odgovor.send(stranica);
    }
    /*
      async detalji(zahtjev: Request, odgovor: Response) {
          let sesija = zahtjev.session as RWASession;
          console.log(
              "tip korisnika prilikom zahtjeva za spajanje na stranicu:",
              sesija.tip_korisnika_id
          );
          if (sesija.tip_korisnika_id != 1) {
              odgovor.status(403).send("Zabranjen pristup");
              return;
          }
          let stranica = await this.ucitajStranicu("detalji");
  
          let osobe = await this.tmdbKlijent.dohvatiOsobe();
  
          //neke sad za prikaz osoba z servisa
  
          // Generiranje HTML tablice
          try {
              let tablicaHtml = `
          <table>
              <thead>
                  <tr>
                      <th>Ime i prezime</th>
                      <th>Poznati po</th>
                      <th>Slika</th>
                  </tr>
              </thead>
              <tbody>
      `;
  
              osobe.results.forEach((osoba: any) => {
                  tablicaHtml += `
              <tr>
              <td>${osoba.name}</td>
              <td>${osoba.known_for
                              .map((item: any) => item.title || item.name)
                              .join(", ")}</td>
              <td><img src="https://image.tmdb.org/t/p/w200${
                              osoba.profile_path
                          }" alt="${osoba.name}" /></td>
              <td class="action-buttons">
                  <button class="add" onclick="dodajOsobu('${
                                      osoba.id
                                  }')">Dodaj</button>
                  <button class="delete" onclick="izbrisiOsobu('${
                                      osoba.id
                                  }')">Izbriši</button>
              </td>
          </tr>
      `;
              });
  
              tablicaHtml += `
              </tbody>
          </table>
      `;
  
              stranica = stranica.replace("<table>", "" + tablicaHtml);
          } catch (err) {
              console.error("Greška tijekom dohvata osoba sa TMDB servisa", err);
          }
  
          odgovor.send(stranica);
      }
  */
    async ucitajStranicu(nazivStranice, poruka = "") {
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
    ucitajHTML(htmlStranica) {
        return ds.readFile(__dirname() + "/html/" + htmlStranica + ".html", "utf-8");
    }
}
