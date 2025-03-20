import { KorisnikI } from "src/servisI/korisniciI.js";
import { KorisnikDAO } from "./korisnikDAO.js";
import { Request, Response } from "express";
import { ServisDAO } from "./servisDAO.js";

export class RestKorisnik {
  private kdao;
  private servisDAO;

  constructor() {
    this.kdao = new KorisnikDAO();
    this.servisDAO = new ServisDAO();
  }

  async getKorisnici(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");

    console.log("getKorisnici tu sam");

    let korisnici = await new KorisnikDAO().dajSve();

    odgovor.send(JSON.stringify(korisnici));
  }

  postKorisnici(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");

    const korime = zahtjev.params["korime"];

    if (korime == null || typeof korime != "string") {
      odgovor.status(400);
      odgovor.send({ greska: "nije proslijeđeno korisnicko ime" });
      return;
    }
    try {
      this.servisDAO.dajPrava(korime);
      let poruka = { ok: "uspjeh" };
      odgovor.status(201);
      odgovor.send(JSON.stringify(poruka));
    } catch (err) {
      console.error("Greška tijekom dodavnja prava korisniku:", err);
      odgovor.status(400).json({ greska: "Greška tijekom dodavanja prava." });
    }
  }

  deleteKorisnici(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    odgovor.status(405);
    let poruka = { greska: "Zabranjena metoda" };
    odgovor.send(JSON.stringify(poruka));
  }

  putKorisnici(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    odgovor.status(405);
    let poruka = { greska: "Zabranjena metoda" };
    odgovor.send(JSON.stringify(poruka));
  }

  getKorisnikPrijava(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    let korime = zahtjev.params["korime"];
    console.log(korime);
    if (korime == undefined) {
      odgovor.status(401);
      odgovor.send(JSON.stringify({ greska: "Krivi podaci!" }));
      console.log("nemogu getKorisnikPrijava -korime undefined");
      return;
    }

    this.kdao.daj(korime).then((korisnik: KorisnikI | null) => {
      console.log(korisnik);
      console.log(zahtjev.body);
      if (korisnik != null) {
        korisnik.lozinka = null;
        odgovor.send(JSON.stringify(korisnik));
      } else {
        odgovor.status(401);
        odgovor.send(JSON.stringify({ greska: "Krivi podaci!" }));
      }
    });
  }

  getKorisnik(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    odgovor.status(405);
    let poruka = { greska: "zabranjena metoda" };
    odgovor.send(JSON.stringify(poruka));
  }

  postKorisnik(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    odgovor.status(405);
    let poruka = { greska: "zabranjena metoda" };
    odgovor.send(JSON.stringify(poruka));
  }

  putKorisnik(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    odgovor.status(405);
    let poruka = { greska: "zabranjena metoda" };
    odgovor.send(JSON.stringify(poruka));
  }

  deleteKorisnik(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    if (zahtjev.params["korime"] != undefined) {
      this.kdao.obrisi(zahtjev.params["korime"]);
      let poruka = { ok: "uspjeh" };
      odgovor.status(201);
      odgovor.send(JSON.stringify(poruka));
      return;
    }
    odgovor.status(400);
    let poruka = { greska: "Nedostaje korisnicko ime za brisanje korisnika" };
    odgovor.send(JSON.stringify(poruka));
  }
}
