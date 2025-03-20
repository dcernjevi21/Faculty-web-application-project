import dsPromise from "fs/promises";

type tipKonf = {
  jwtValjanost: string;
  jwtTajniKljuc: string;
  tajniKljucSesija: string;
  tmdbApiKeyV3: string;
  tmdbApiKeyV4: string;
  recaptchaTajniKljuc: string;
};

export class Konfiguracija {
  private konf: tipKonf;
  constructor() {
    this.konf = this.initKonf();
  }
  private initKonf() {
    return {
      jwtTajniKljuc: "",
      jwtValjanost: "",
      tajniKljucSesija: "",
      tmdbApiKeyV3: "",
      tmdbApiKeyV4: "",
      recaptchaTajniKljuc: "",
    };
  }
  dajKonf() {
    return this.konf;
  }
  dajKonfRecaptcha() {
    return this.konf.recaptchaTajniKljuc;
  }

  public async ucitajKonfiguraciju() {
    if (process.argv[2] == undefined)
      throw new Error("Nedostaje putanja do konfiguracijske datoteke");
    let putanja: string = process.argv[2];

    console.log(this.konf);
    var podaci = await dsPromise.readFile(putanja, {
      encoding: "utf-8",
    });
    console.log(podaci);
    this.pretvoriJSONkonfig(podaci);
    this.provjeriPodatkeKonfiguracije();
  }

  private pretvoriJSONkonfig(podaci: string) {
    console.log(podaci);
    let konf: { [kljuc: string]: string } = {};
    var nizPodataka = podaci.split("\n");
    for (let podatak of nizPodataka) {
      var podatakNiz = podatak.split("=");
      var naziv = podatakNiz[0];
      console.log(podatakNiz);
      if (typeof naziv != "string" || naziv == "") continue;
      var vrijednost: string = podatakNiz[1] ?? "";
      konf[naziv] = vrijednost;
    }
    this.konf = konf as tipKonf;
  }

  private provjeriPodatkeKonfiguracije() {
    if (
      this.konf.tmdbApiKeyV3 == undefined ||
      this.konf.tmdbApiKeyV3.trim() == ""
    ) {
      throw new Error("Fali TMDB API ključ u tmdbApiKeyV3");
    }
    if (
      this.konf.jwtValjanost == undefined ||
      this.konf.jwtValjanost.trim() == ""
    ) {
      throw new Error("Fali JWT valjanost");
    }
    if (
      Number(this.konf.jwtValjanost) < 15 ||
      Number(this.konf.jwtValjanost) > 300
    ) {
      throw new Error(
        "Vrijednost JWT valjanosti nije u zadanom rasponu [15-300]"
      );
    }
    if (
      this.konf.jwtTajniKljuc == undefined ||
      this.konf.jwtTajniKljuc.trim() == ""
    ) {
      throw new Error("Fali JWT tajni kljuc");
    }
    if (
      this.konf.jwtTajniKljuc.length < 100 ||
      this.konf.jwtTajniKljuc.length > 200
    ) {
      throw new Error(
        "Vrijednost JWT tajnog ključa nije u zadanom rasponu [100-200]"
      );
    }
    if (
      this.konf.tajniKljucSesija == undefined ||
      this.konf.tajniKljucSesija.trim() == ""
    ) {
      throw new Error("Fali tajni ključ za sesiju");
    }
    if (
      this.konf.tajniKljucSesija.length < 100 ||
      this.konf.tajniKljucSesija.length > 200
    ) {
      throw new Error(
        "Vrijednost tajnog ključa za sesiju nije u zadanom rasponu [100-200]"
      );
    }
  }
}
