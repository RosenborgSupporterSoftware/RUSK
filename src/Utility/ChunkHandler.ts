/**
 * ChunkHandler.ts
 * Experimental class that provides chunking functionality.
 * This will hopefully result in stable code that can help RUSK store larger amounts of configuration data.
 *
 */

/** A simple class that represents a single chunk of data */
export class Chunk {

    private _name: string;
    /**
     * Gets the name given to this chunk
     */
    public get Name(): string {
        return this._name;
    }

    private _seq: number;
    /**
     * Gets the sequence number of this chunk
     */
    public get Sequence(): number {
        return this._seq;
    }

    private _csum: number;
    /**
     * Gets the checksum for the data
     */
    public get Checksum(): number {
        return this._csum;
    }

    private _data: string;

    /**
     * Gets the actual data represented by this Chunk object
     */
    public get Data(): string {
        return this._data;
    }

    constructor(name: string, sequence: number, checksum: number, data: string) {
        this._name = name;
        this._seq = sequence;
        this._csum = checksum;
        this._data = data;
    }

    /** Gets a pure JSON string representation of this chunk */
    public ToJSON(): string {
        return JSON.stringify({
            name: this.Name,
            seq: this.Sequence,
            checksum: this.Checksum,
            data: this.Data
        });
    }

    /** Gets a Chunk object from a JSON string */
    public static FromJSON(json: string): Chunk {
        let obj = JSON.parse(json);

        return new Chunk(obj.name, obj.seq, obj.checksum, obj.data);
    }
}

/** A class for splitting data into chunks and reassembling it again */
export class ChunkHandler {

    public Chunkify(input: any, chunkName: string, chunkSize: number = 8000): Array<Chunk> {
        if (typeof input != "string") {
            input = JSON.stringify(input);
        }
        let encoded = this.EncodeString(input);
        let chunks = new Array<Chunk>();

        let seq = 0;
        for (let idx = 0; idx < encoded.length; idx += chunkSize) {
            let data = encoded.substr(idx, chunkSize);
            let csum = this.Checksum(data);
            chunks.push(new Chunk(name, seq, csum, data));
        }

        return chunks;
    }

    public Dechunkify(chunks: Array<Chunk>): string {

        if (chunks == null || chunks.length == 0) return '';

        let ordered = chunks.sort((a, b) => { return b.Sequence - a.Sequence });
        let encoded = "";
        ordered.forEach(ch => {
            if (this.Checksum(ch.Data) != ch.Checksum) {
                throw new Error('Corrupt input data in chunk ' + ch.Name + ' sequence #' + ch.Sequence + '!');
            }
            encoded += ch.Data;
        });

        return this.DecodeString(encoded);
    }

    /**
     * Encode a string as base 64, handling UTF-8 and other stuff that atob() bombs on.
     * @param inputString - The string to encode
     */
    public EncodeString(inputString: string): string {
        return this.Base64.encode(inputString);
    }

    /**
     * Decode a string that has been encoded using EncodeString
     * @param inputString - The string to decode
     */
    public DecodeString(inputString: string): string {
        return this.Base64.decode(inputString);
    }

    /**
     * Create a simple checksum value from an input string to verify uncorrupt data
     * @param inputString - The input string to create a checksum for
     */
    public Checksum(inputString: string): number {
        return this.checksum(inputString);
    }

    // Borrowed from www.webtoolkit.info
    // Ref: https://stackoverflow.com/questions/23223718/failed-to-execute-btoa-on-window-the-string-to-be-encoded-contains-characte
    private Base64 = {

        // private property
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

        // public method for encoding
        , encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = this._utf8_encode(input);

            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                }
                else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            } // Whend

            return output;
        } // End Function encode


        // public method for decoding
        , decode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }

                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            } // Whend

            output = this._utf8_decode(output);

            return output;
        } // End Function decode


        // private method for UTF-8 encoding
        , _utf8_encode: function (string) {
            var utftext = "";
            string = string.replace(/\r\n/g, "\n");

            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            } // Next n

            return utftext;
        } // End Function _utf8_encode

        // private method for UTF-8 decoding
        , _utf8_decode: function (utftext) {
            var string = "";
            var i = 0;
            var c, c1, c2, c3;
            c = c1 = c2 = 0;

            while (i < utftext.length) {
                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            } // Whend

            return string;
        } // End Function _utf8_decode
    }

    // Stolen from https://gist.github.com/Facel3ss1/6e36392ff5b2603ee3f514ae6744cd1a
    checksum(s: string): number {
        var hash = 0, strlen = s.length, i, c;
        if (strlen === 0) {
            return hash;
        }
        for (i = 0; i < strlen; i++) {
            c = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + c;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };
}