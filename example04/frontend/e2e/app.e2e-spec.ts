import { SynqposWebPage } from './app.po';

describe('synqpos App', () => {
  let page: SynqposWebPage;

  beforeEach(() => {
    page = new SynqposWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
