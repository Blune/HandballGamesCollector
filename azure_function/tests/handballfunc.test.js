const handball = require('../src/functions/FetchHandballData.js');
const fetch = require('node-fetch');
const { BlobServiceClient } = require('@azure/storage-blob');

jest.mock('node-fetch');
jest.mock('@azure/storage-blob');

describe('getMatchDates', () => {
  it('should return the mondays of weeks with matches', async () => {
    const mockResponse = {
      "menu": {
        "dt": {
          "list": {
            "2023-08-28": "",
            "2023-09-04": ""
          }
        }
      }
    };
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce([mockResponse]),
    });

    const result = await handball.getMatchDates("test");
    expect(result).toEqual(["2023-08-28", "2023-09-04"]);
  });
});

describe('getAllGames', () => {
  it('should return all games', async () => {
    const mockResponse = {
      "testdata": {}
    };
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockReturnValue(mockResponse),
    });

    const result = await handball.getAllGames(["test"]);
    expect(result).toEqual([mockResponse]);
  });
});

describe('getDateTime', () => {
  test('should transform the date and time string to a datetime object', async () => {
    expect(handball.getDateTime("10.10.23", "17:15"))
      .toStrictEqual(new Date("2023-10-10T17:15:00.000Z"));
  });
});

describe('fetchAndStoreGames', () => {
  test('should run without errors', async () => {
    const mockResponse = {
      "menu": {
        "dt": {
          "list": {
            "2023-08-28": ""
          }
        }
      }
    };
    const mockData = [{
      "content": {
        "classes": [
          {
            "gClassSname": "Liga1",
            "games": [{
              "gHomeTeam": "TSV Foo",
              "gGuestTeam": "TSV Bar",
              "gDate": "29.11.23",
              "gWDay": "Mi",
              "gTime": "19:00",
              "gGymnasiumName": "ratiopharm-Sporthalle",
              "gGymnasiumTown": "Berlin",
              "gHomeGoals": "0",
              "gGuestGoals": "0",
              "gHomeGoals_1": "0",
              "gGuestGoals_1": "0",
              "gHomePoints": "2",
              "gGuestPoints": "0",
            }]
          }
        ]
      }
    }
    ]
    fetch
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce([mockResponse]),
      })
      .mockResolvedValue({
        json: jest.fn().mockResolvedValueOnce(mockData),
      });
    const mockUpload = jest.fn().mockResolvedValue('Mocked upload result');
    const mockGetBlockBlobClient = jest.fn().mockReturnValue({ upload: mockUpload });
    const mockContainerClient = { getBlockBlobClient: mockGetBlockBlobClient };

    BlobServiceClient.fromConnectionString.mockReturnValue({
      getContainerClient: jest.fn().mockReturnValueOnce(mockContainerClient),
    });

    expect(handball.fetchAndStoreGames(new Date(), 3, 3, "test", "test", "test", null)).resolves
      .not.toThrowError();
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
      .toStrictEqual("2023-11-06");
  });
});

describe('storeInContainer function', () => {
  it('uploads data to the container', async () => {
    const mockUpload = jest.fn().mockResolvedValue('Mocked upload result');
    const mockGetBlockBlobClient = jest.fn().mockReturnValueOnce({ upload: mockUpload });
    const mockContainerClient = { getBlockBlobClient: mockGetBlockBlobClient };

    handball.storeInContainer(mockContainerClient, { key: 'value' }, 'mockedBlobName');

    expect(mockGetBlockBlobClient).toHaveBeenCalledWith('mockedBlobName');
    expect(mockUpload).toHaveBeenCalledWith(
      JSON.stringify({ key: 'value' }),
      JSON.stringify({ key: 'value' }).length
    );
  });
});

describe('getContainerClient', () => {
  it('returns a mocked container client', () => {
    const mockContainerClient = {};

    BlobServiceClient.fromConnectionString.mockReturnValueOnce({
      getContainerClient: jest.fn().mockReturnValueOnce(mockContainerClient),
    });

    const containerClient = handball.getContainerClient('mockedConnectionString', 'mockedContainerName');

    expect(BlobServiceClient.fromConnectionString).toHaveBeenCalledWith('mockedConnectionString');
    expect(containerClient).toBe(mockContainerClient);
  });
});

describe('getAllGamesOfTeam', () => {
  test('getAllGamesOfTeam', async () => {
    const mockData = [[{
      "content": {
        "classes": [
          {
            "gClassSname": "Liga1",
            "games": [{
              "gHomeTeam": "TSV Foo",
              "gGuestTeam": "TSV Bar",
              "gDate": "29.11.23",
              "gWDay": "Mi",
              "gTime": "19:00",
              "gGymnasiumName": "ratiopharm-Sporthalle",
              "gGymnasiumTown": "Berlin",
              "gHomeGoals": "0",
              "gGuestGoals": "0",
              "gHomeGoals_1": "0",
              "gGuestGoals_1": "0",
              "gHomePoints": "2",
              "gGuestPoints": "0",
            }]
          },
          {
            "gClassSname": "Liga2",
            "games": [{
              "gHomeTeam": "TSV Bar",
              "gGuestTeam": "TSV Foo",
              "gDate": "29.11.23",
              "gWDay": "Mi",
              "gTime": "17:00",
              "gGymnasiumName": "ratiopharm-Sporthalle",
              "gGymnasiumTown": "Berlin",
              "gHomeGoals": "0",
              "gGuestGoals": "0",
              "gHomeGoals_1": "0",
              "gGuestGoals_1": "0",
              "gHomePoints": "2",
              "gGuestPoints": "0",
            }]
          }
        ]
      }
    }
    ]]
    const games = await handball.getAllGamesOfTeam(mockData, "Foo")
    expect(games.length).toEqual(2);
    expect(games).toEqual([
      {
        "date": "29.11.23",
        "dateCompare": new Date("2023-11-29T19:00:00.000Z"),
        "day": "Mi",
        "goals": "0",
        "home": "TSV Foo",
        "match": "TSV Foo vs TSV Bar",
        "matchtype": "A",
        "opponent": "TSV Bar",
        "opponentgoals": "0",
        "place": "in Berlin",
        "shortteamname": "",
        "team": "Liga1",
        "teamname": "Liga1",
        "time": "19:00",
        "upperteamname": "Liga1"
      },
      {
        "date": "29.11.23",
        "dateCompare": new Date("2023-11-29T17:00:00.000Z"),
        "day": "Mi",
        "goals": "0",
        "home": "TSV Foo",
        "match": "TSV Bar vs TSV Foo",
        "matchtype": "A",
        "opponent": "TSV Bar",
        "opponentgoals": "0",
        "place": "in Berlin",
        "shortteamname": "",
        "team": "Liga2",
        "teamname": "Liga2",
        "time": "17:00",
        "upperteamname": "Liga2"
      }]);
  });
});

describe('getNextGamesOfTeam', () => {
  test('Should return next games', async () => {
    const mockData = [
      {
        //Should be removed
        "date": "29.08.23",
        "dateCompare": new Date("2023-08-29T18:00:00.000Z"),
        "day": "Mi",
        "goals": "0",
        "home": "TSV Foo",
        "match": "TSV Foo vs TSV Bar",
        "matchtype": "A",
        "opponent": "TSV Bar",
        "opponentgoals": "0",
        "place": "in Berlin",
        "shortteamname": "",
        "team": "Liga1",
        "teamname": "Liga1",
        "time": "19:00",
        "upperteamname": "Liga1"
      },
      {
        "date": "29.11.23",
        "dateCompare": new Date("2023-11-29T16:00:00.000Z"),
        "day": "Mi",
        "goals": "0",
        "home": "TSV Foo",
        "match": "TSV Bar vs TSV Foo",
        "matchtype": "A",
        "opponent": "TSV Bar",
        "opponentgoals": "0",
        "place": "in Berlin",
        "shortteamname": "",
        "team": "Liga2",
        "teamname": "Liga2",
        "time": "17:00",
        "upperteamname": "Liga2"
      },
      {
        "date": "30.11.23",
        "dateCompare": new Date("2023-11-30T16:00:00.000Z"),
        "day": "Mi",
        "goals": "0",
        "home": "TSV Foo",
        "match": "TSV Bar vs TSV Foo",
        "matchtype": "A",
        "opponent": "TSV Bar",
        "opponentgoals": "0",
        "place": "in Berlin",
        "shortteamname": "",
        "team": "Liga2",
        "teamname": "Liga2",
        "time": "17:00",
        "upperteamname": "Liga2"
      },
      {
        "date": "30.11.23",
        "dateCompare": new Date("2023-11-30T16:00:00.000Z"),
        "day": "Mi",
        "goals": "0",
        "home": "TSV Foo",
        "match": "TSV Bar vs TSV Foo",
        "matchtype": "A",
        "opponent": "TSV Bar",
        "opponentgoals": "0",
        "place": "in Berlin",
        "shortteamname": "",
        "team": "Liga3",
        "teamname": "Liga2",
        "time": "17:00",
        "upperteamname": "Liga2"
      }]
    const games = await handball.getNextMatches(new Date(2023, 10, 1), mockData)
    expect(games.length).toEqual(2);
    expect(games).toEqual(
      [
        {
          date: '29.11.23',
          dateCompare: new Date("2023-11-29T16:00:00.000Z"),
          day: 'Mi',
          goals: '0',
          home: 'TSV Foo',
          match: 'TSV Bar vs TSV Foo',
          matchtype: 'A',
          opponent: 'TSV Bar',
          opponentgoals: '0',
          place: 'in Berlin',
          shortteamname: '',
          team: 'Liga2',
          teamname: 'Liga2',
          time: '17:00',
          upperteamname: 'Liga2'
        },
        {
          date: '30.11.23',
          dateCompare: new Date("2023-11-30T16:00:00.000Z"),
          day: 'Mi',
          goals: '0',
          home: 'TSV Foo',
          match: 'TSV Bar vs TSV Foo',
          matchtype: 'A',
          opponent: 'TSV Bar',
          opponentgoals: '0',
          place: 'in Berlin',
          shortteamname: '',
          team: 'Liga3',
          teamname: 'Liga2',
          time: '17:00',
          upperteamname: 'Liga2'
        }
      ]
    )
  });
});

describe('mapTeamName', () => {
  describe('should return all short names of the teams', () => {
    const dataSet = [
      ["M-BK-D", 'M1', 'Männer 1', 'MÄNNER 1'],
      ["M-2BK-D", 'M2', 'Männer 2', 'MÄNNER 2'],
      ["F-BL", 'D1', 'Damen 1', 'DAMEN 1'],
      ["F-BK-D", 'D2', 'Damen 2', 'DAMEN 2'],
      ["gJD-3BK-1", 'gD', 'Gemischte D-Jugend', 'gD-JUGEND'],
      ["wJD-BK-1", 'wD', 'Weibliche D-Jugend', 'wD-JUGEND'],
      ["wJA-BL-1", 'wA', 'Weibliche A-Jugend', 'wA-JUGEND'],
      ["gJE-6+1", 'gE', 'Gemischte E-Jugend', 'gE-JUGEND'],
      ["mJA-BL", 'mA', 'Männliche A-Jugend', 'mA-JUGEND'],
      ["mJC-BK-1", 'mC', 'Männliche C-Jugend', 'mC-JUGEND'],
      ["gJF-1", 'gF', 'Gemischte F-Jugend', 'gF-JUGEND'],
      ["F-Pok-B", 'wP', 'Pokalspiel D1', 'DAMEN 1 (POKAL)'],
      ["ABCDES", '', 'ABCDES', 'ABCDES'],
    ];

    it.each(dataSet)('should return the short name of the team', (team, short, long, upper) => {
      const result = handball.mapTeamName(team);

      expect(result).toStrictEqual({ short: short, long: long, upper: upper });
    });
  });
});
