export interface KorisnikI {
  email: string;
  korime: string;
  lozinka: string | null;
  ime: string;
  prezime: string;
  adresa: string;
  telefon: string;
  datum_rodenja: string;
  tip_korisnika_id: string;
  ima_pristup: number;
  zatrazio_pristup: number;
  totp_tajniKljuc: string;
  two_factor: boolean;
}
