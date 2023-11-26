const  handball  = require('../src/functions/FetchHandballData.js');

describe('getDateTime', () => {
  test('should transform the date and time string to a datetime object', async () => {
    expect(handball.getDateTime("10.10.23", "17:15"))
    .toStrictEqual(new Date("2023-10-10T15:15:00.000Z"));
  });
});

describe('mapTeamName', () => {
  test('should return the correct team name', async () => {
    expect(handball.mapTeamName("M-KLA-D", ""))
    .toStrictEqual({ short: 'M1', long: 'Männer 1', upper: 'MÄNNER 1' });
  });
});

describe('mapTeamName', () => {
  test('should return the correct team name for the women team 1', async () => {
    expect(handball.mapTeamName("F-KLA-D", "TSV Laichingen"))
    .toStrictEqual({ short: 'D1', long: 'Damen 1', upper: 'DAMEN 1' });
  });
});

describe('mapTeamName', () => {
  test('should return the correct team name for the women team 2', async () => {
    expect(handball.mapTeamName("F-KLA-D", "TSV Laichingen 2"))
    .toStrictEqual({ short: 'D2', long: 'Damen 2', upper: 'DAMEN 2' });
  });
});

describe('getDateOfMonday', () => {
  test('should return the date of monday of the current week', async () => {
    expect(handball.getDateOfMonday(new Date(2023, 10, 11)))
    .toStrictEqual("2023-11-05");
  });
});

