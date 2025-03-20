import dsPromise from "fs/promises";
export class Konfiguracija {
    // dodati export
    konf;
    constructor() {
        this.konf = this.initKonf();
    }
    initKonf() {
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
    async ucitajKonfiguraciju() {
        if (process.argv[2] == undefined)
            throw new Error("Nedostaje putanja do konfiguracijske datoteke");
        let putanja = process.argv[2];
        console.log(this.konf);
        // await
        var podaci = await dsPromise.readFile(putanja, {
            encoding: "utf-8",
        });
        console.log(podaci);
        this.pretvoriJSONkonfig(podaci);
        this.provjeriPodatkeKonfiguracije();
    }
    pretvoriJSONkonfig(podaci) {
        console.log(podaci);
        // dinamički tip, objekt moze imati koliko god atributa zelita
        let konf = {};
        var nizPodataka = podaci.split("\n");
        for (let podatak of nizPodataka) {
            var podatakNiz = podatak.split("=");
            var naziv = podatakNiz[0];
            console.log(podatakNiz);
            if (typeof naziv != "string" || naziv == "")
                continue;
            var vrijednost = podatakNiz[1] ?? "";
            konf[naziv] = vrijednost;
        }
        this.konf = konf;
    }
    provjeriPodatkeKonfiguracije() {
        if (this.konf.tmdbApiKeyV3 == undefined ||
            this.konf.tmdbApiKeyV3.trim() == "") {
            throw new Error("Fali TMDB API ključ u tmdbApiKeyV3");
        }
        if (this.konf.jwtValjanost == undefined ||
            this.konf.jwtValjanost.trim() == "") {
            throw new Error("Fali JWT valjanost");
        }
        if (Number(this.konf.jwtValjanost) < 15 ||
            Number(this.konf.jwtValjanost) > 300) {
            throw new Error("Vrijednost JWT valjanosti nije u zadanom rasponu [15-300]");
        }
        if (this.konf.jwtTajniKljuc == undefined ||
            this.konf.jwtTajniKljuc.trim() == "") {
            throw new Error("Fali JWT tajni kljuc");
        }
        if (this.konf.jwtTajniKljuc.length < 100 ||
            this.konf.jwtTajniKljuc.length > 200) {
            throw new Error("Vrijednost JWT tajnog ključa nije u zadanom rasponu [100-200]");
        }
        if (this.konf.tajniKljucSesija == undefined ||
            this.konf.tajniKljucSesija.trim() == "") {
            throw new Error("Fali tajni ključ za sesiju");
        }
        if (this.konf.tajniKljucSesija.length < 100 ||
            this.konf.tajniKljucSesija.length > 200) {
            throw new Error("Vrijednost tajnog ključa za sesiju nije u zadanom rasponu [100-200]");
        }
    }
}
