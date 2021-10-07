export enum RubiRoutePath {
  INDEX = '/',
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
];

export default routes;
