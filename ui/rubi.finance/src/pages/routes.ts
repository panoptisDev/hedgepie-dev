export enum RubiRoutePath {
  INDEX = '/',
  SIGNIN = '/signin'
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
];

export default routes;
