import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { OptionInterface } from "../../option.interface";
import { CountryInterface } from "./country.interface";
import { CountryCodeInterface } from "./country-code.interface";

@Injectable({
  providedIn: "root",
})
export class CountryService {
  constructor(private http: HttpClient) {}
  private baseApiUrl = "https://restcountries.com/v3.1/all";

  getCountryOptions(): Observable<OptionInterface[]> {
    return this.http
      .get<CountryInterface[]>(`${this.baseApiUrl}?fields=name`)
      .pipe(
        map((countries: CountryInterface[]) => {
          return countries.map(({ name }) => {
            return { label: name.common, value: name.common };
          });
        }),
        map((countries) =>
          countries.sort((a, b) => a.label.localeCompare(b.label))
        )
      );
  }

  getCountryCodeOptions(): Observable<OptionInterface[]> {
    return this.http
      .get<CountryCodeInterface[]>(`${this.baseApiUrl}?fields=idd,cca2`)
      .pipe(
        map((codes) => {
          const res = [];

          codes.forEach(({ idd, cca2 }) => {
            const { root, suffixes } = idd;

            suffixes.forEach((suffix) => {
              res.push({
                label: `${cca2} (${root}${suffix})`,
                value: `${root}${suffix}`,
              });
            });
          });
          return res;
        })
      );
  }
}
