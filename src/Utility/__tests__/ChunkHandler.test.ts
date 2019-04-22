import { ChunkHandler, Chunk } from "../ChunkHandler";

/**
 * Tests for ChunkHandler.ts
 */

describe('Chunk related', () => {

    describe('ChunkHandler', () => {

        describe('Encode / Decode', () => {

            it('functions well when doing roundtrip on simple string', () => {
                const original = 'So this is some pretty simple basic input string...!';
                let sut = new ChunkHandler();

                let encoded = sut.EncodeString(original);
                let res = sut.DecodeString(encoded);

                expect(res).toEqual(original);
                expect(encoded).not.toEqual(original);
            });

            it('handles a JSON object well', () => {

                const obj = {
                    something: [
                        'Plague',
                        'Famine',
                        'Konesseur'
                    ],
                    hey: 'What up',
                    complex: {
                        subthing: {
                            ha: 'Even more'
                        }
                    }
                };
                let input = JSON.stringify(obj);
                let sut = new ChunkHandler();

                let encoded = sut.EncodeString(input);
                let res = sut.DecodeString(encoded);
                let copy = JSON.parse(res);

                expect(res).toEqual(input);
                expect(copy).toEqual(obj);
            });

        });

        describe('Checksum', () => {

            it('consistently returns same value for same input', () => {
                let sut = new ChunkHandler();
                let r = [];
                for (let i = 0; i < 1000; i++) {
                    r.push(Math.random() * 738);
                }
                let obj = {
                    values: r
                };
                let str = sut.EncodeString(JSON.stringify(obj));

                let res1 = sut.Checksum(str);
                let res2 = sut.Checksum(str);

                expect(res1).toEqual(res2);
            });

        });

        describe('Chunkify roundtrip', () => {

            it('chunks and dechunks something that can actually be reassembled', () => {
                let sut = new ChunkHandler();
                let r = [];
                for (let i = 0; i < 1000; i++) {
                    r.push(Math.random() * 738);
                }
                let obj = {
                    values: r
                };
                let chunks = sut.Chunkify(obj, 'Testobject');

                let dechunked = sut.Dechunkify(chunks);
                let res = JSON.parse(dechunked);
                expect(res).toEqual(obj);
            });

        });

    });

    describe('Chunk', () => {

        describe('JSON roundtrip', () => {

            it('roundtrips simple object properly', () => {
                let chunk = new Chunk('Test chunk', 12, 1234, '0123456789');
                let json = chunk.ToJSON();
                let copy = Chunk.FromJSON(json);

                expect(copy).toEqual(chunk);
            });
        });
    });
});
