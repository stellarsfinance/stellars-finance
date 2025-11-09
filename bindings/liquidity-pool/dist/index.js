import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAADUNvbmZpZ01hbmFnZXIAAAAAAAAAAAAAAAAAAAVUb2tlbgAAAAAAAAAAAAAAAAAAC1RvdGFsU2hhcmVzAAAAAAAAAAAAAAAADVRvdGFsRGVwb3NpdHMAAAAAAAABAAAAAAAAAAZTaGFyZXMAAAAAAAEAAAAT",
            "AAAAAAAAAEtHZXQgdGhlIHRva2VuIGFkZHJlc3MgZm9yIHRoaXMgcG9vbC4KCiMgUmV0dXJucwoKVGhlIHRva2VuIGNvbnRyYWN0IGFkZHJlc3MAAAAABXRva2VuAAAAAAAAAAAAAAEAAAAT",
            "AAAAAAAAAQNEZXBvc2l0IHRva2VucyBpbnRvIHRoZSBsaXF1aWRpdHkgcG9vbCBhbmQgcmVjZWl2ZSBMUCBzaGFyZXMuCgojIEFyZ3VtZW50cwoKKiBgdXNlcmAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgZGVwb3NpdG9yCiogYGFtb3VudGAgLSBUaGUgYW1vdW50IG9mIHRva2VucyB0byBkZXBvc2l0CgojIFJldHVybnMKClRoZSBudW1iZXIgb2YgTFAgc2hhcmVzIG1pbnRlZCB0byB0aGUgdXNlcgoKIyBQYW5pY3MKClBhbmljcyBpZiBhbW91bnQgaXMgbm90IHBvc2l0aXZlAAAAAAdkZXBvc2l0AAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAACw==",
            "AAAAAAAAAR5XaXRoZHJhdyB0b2tlbnMgZnJvbSB0aGUgbGlxdWlkaXR5IHBvb2wgYnkgYnVybmluZyBMUCBzaGFyZXMuCgojIEFyZ3VtZW50cwoKKiBgdXNlcmAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgd2l0aGRyYXdlcgoqIGBzaGFyZXNgIC0gVGhlIG51bWJlciBvZiBMUCBzaGFyZXMgdG8gYnVybgoKIyBSZXR1cm5zCgpUaGUgYW1vdW50IG9mIHRva2VucyByZXR1cm5lZCB0byB0aGUgdXNlcgoKIyBQYW5pY3MKClBhbmljcyBpZiBzaGFyZXMgaXMgbm90IHBvc2l0aXZlIG9yIGlmIHRvdGFsX3NoYXJlcyBpcyB6ZXJvAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGc2hhcmVzAAAAAAALAAAAAQAAAAs=",
            "AAAAAAAAAIhHZXQgdGhlIExQIHNoYXJlIGJhbGFuY2UgZm9yIGEgdXNlci4KCiMgQXJndW1lbnRzCgoqIGB1c2VyYCAtIFRoZSBhZGRyZXNzIHRvIHF1ZXJ5CgojIFJldHVybnMKClRoZSBudW1iZXIgb2YgTFAgc2hhcmVzIG93bmVkIGJ5IHRoZSB1c2VyAAAACmdldF9zaGFyZXMAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAAAs=",
            "AAAAAAAAAPdJbml0aWFsaXplIHRoZSBsaXF1aWRpdHkgcG9vbCB3aXRoIGNvbmZpZyBtYW5hZ2VyIGFuZCB0b2tlbiBhZGRyZXNzZXMuCgojIEFyZ3VtZW50cwoKKiBgY29uZmlnX21hbmFnZXJgIC0gVGhlIENvbmZpZyBNYW5hZ2VyIGNvbnRyYWN0IGFkZHJlc3MKKiBgdG9rZW5gIC0gVGhlIHRva2VuIGNvbnRyYWN0IGFkZHJlc3MgZm9yIHRoaXMgcG9vbAoKIyBQYW5pY3MKClBhbmljcyBpZiB0aGUgcG9vbCBpcyBhbHJlYWR5IGluaXRpYWxpemVkAAAAAAppbml0aWFsaXplAAAAAAACAAAAAAAAAA5jb25maWdfbWFuYWdlcgAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAA==",
            "AAAAAAAAAE9HZXQgdGhlIENvbmZpZyBNYW5hZ2VyIGFkZHJlc3MuCgojIFJldHVybnMKClRoZSBDb25maWcgTWFuYWdlciBjb250cmFjdCBhZGRyZXNzAAAAAA5jb25maWdfbWFuYWdlcgAAAAAAAAAAAAEAAAAT",
            "AAAAAAAAAFtHZXQgdGhlIHRvdGFsIG51bWJlciBvZiBMUCBzaGFyZXMgaW4gY2lyY3VsYXRpb24uCgojIFJldHVybnMKClRoZSB0b3RhbCBudW1iZXIgb2YgTFAgc2hhcmVzAAAAABBnZXRfdG90YWxfc2hhcmVzAAAAAAAAAAEAAAAL",
            "AAAAAAAAAGJHZXQgdGhlIHRvdGFsIGFtb3VudCBvZiB0b2tlbnMgZGVwb3NpdGVkIGluIHRoZSBwb29sLgoKIyBSZXR1cm5zCgpUaGUgdG90YWwgZGVwb3NpdGVkIHRva2VuIGFtb3VudAAAAAAAEmdldF90b3RhbF9kZXBvc2l0cwAAAAAAAAAAAAEAAAAL"]), options);
        this.options = options;
    }
    fromJSON = {
        token: (this.txFromJSON),
        deposit: (this.txFromJSON),
        withdraw: (this.txFromJSON),
        get_shares: (this.txFromJSON),
        initialize: (this.txFromJSON),
        config_manager: (this.txFromJSON),
        get_total_shares: (this.txFromJSON),
        get_total_deposits: (this.txFromJSON)
    };
}
