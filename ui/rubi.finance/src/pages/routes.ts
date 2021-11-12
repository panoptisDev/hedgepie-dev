export enum RubiRoutePath {
  INDEX = '/',
  SIGNIN = '/signin',
  CONNECTWALLET = '/connectwallet',
  MyCOLLECTION = '/collection',
  VAULTS = '/vaults',

}

export type RubiRoute = {
  entry: string;
  route: RubiRoutePath[keyof RubiRoutePath];
  exact?: boolean;
}

const routes: RubiRoute[] = [
  {
    entry: 'Index/index',
    route: RubiRoutePath.INDEX,
    exact: true
  },
  {
    entry: 'Signin/index',
    route: RubiRoutePath.SIGNIN,
    exact: true
  },
  {
    entry: 'ConnectWallet/index',
    route: RubiRoutePath.CONNECTWALLET,
    exact: true
  },
  {
    entry: 'MyCollection/index',
    route: RubiRoutePath.MyCOLLECTION,
    exact: true
  },
  {
    entry: 'Vaults/index',
    route: RubiRoutePath.VAULTS,
    exact: true
  },

];

export default routes;
