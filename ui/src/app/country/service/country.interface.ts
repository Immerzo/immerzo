export interface CountryInterface {
  name: {
    common: string;
    official: string;
    nativeName: { cat: { official: string; common: string } };
  };
}
