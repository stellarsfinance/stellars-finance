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
        super(new ContractSpec(["AAAAAAAAAG5QYXVzZSBhIG1hcmtldCB0byBwcmV2ZW50IG5ldyBwb3NpdGlvbnMgZnJvbSBiZWluZyBvcGVuZWQuCgojIEFyZ3VtZW50cwoKKiBgbWFya2V0X2lkYCAtIFRoZSBtYXJrZXQgaWRlbnRpZmllcgAAAAAADHBhdXNlX21hcmtldAAAAAEAAAAAAAAACW1hcmtldF9pZAAAAAAAAAQAAAAA",
            "AAAAAAAAAQlJbml0aWFsaXplIGEgbmV3IHBlcnBldHVhbCBtYXJrZXQuCgojIEFyZ3VtZW50cwoKKiBgbWFya2V0X2lkYCAtIFVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgbWFya2V0IChlLmcuLCAwID0gWExNLVBFUlApCiogYG1heF9vcGVuX2ludGVyZXN0YCAtIE1heGltdW0gdG90YWwgb3BlbiBpbnRlcmVzdCBhbGxvd2VkIGZvciB0aGlzIG1hcmtldAoqIGBtYXhfZnVuZGluZ19yYXRlYCAtIE1heGltdW0gZnVuZGluZyByYXRlIHBlciBob3VyIChpbiBiYXNpcyBwb2ludHMpAAAAAAAADWNyZWF0ZV9tYXJrZXQAAAAAAAADAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAEAAAAAAAAABFtYXhfb3Blbl9pbnRlcmVzdAAAAAAAAAsAAAAAAAAAEG1heF9mdW5kaW5nX3JhdGUAAAALAAAAAA==",
            "AAAAAAAAAFxVbnBhdXNlIGEgbWFya2V0IHRvIGFsbG93IG5ldyBwb3NpdGlvbnMuCgojIEFyZ3VtZW50cwoKKiBgbWFya2V0X2lkYCAtIFRoZSBtYXJrZXQgaWRlbnRpZmllcgAAAA51bnBhdXNlX21hcmtldAAAAAAAAQAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAA=",
            "AAAAAAAAAJ5HZXQgdGhlIGN1cnJlbnQgZnVuZGluZyByYXRlIGZvciBhIG1hcmtldC4KCiMgQXJndW1lbnRzCgoqIGBtYXJrZXRfaWRgIC0gVGhlIG1hcmtldCBpZGVudGlmaWVyCgojIFJldHVybnMKClRoZSBjdXJyZW50IGZ1bmRpbmcgcmF0ZSAoaW4gYmFzaXMgcG9pbnRzIHBlciBob3VyKQAAAAAAEGdldF9mdW5kaW5nX3JhdGUAAAABAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAEAAAAAQAAAAs=",
            "AAAAAAAAAJBDaGVjayBpZiBhIG1hcmtldCBpcyBjdXJyZW50bHkgcGF1c2VkLgoKIyBBcmd1bWVudHMKCiogYG1hcmtldF9pZGAgLSBUaGUgbWFya2V0IGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVHJ1ZSBpZiBtYXJrZXQgaXMgcGF1c2VkLCBmYWxzZSBvdGhlcndpc2UAAAAQaXNfbWFya2V0X3BhdXNlZAAAAAEAAAAAAAAACW1hcmtldF9pZAAAAAAAAAQAAAABAAAAAQ==",
            "AAAAAAAAAQlDaGVjayBpZiBhIG5ldyBwb3NpdGlvbiBjYW4gYmUgb3BlbmVkIGJhc2VkIG9uIE9JIGxpbWl0cy4KCiMgQXJndW1lbnRzCgoqIGBtYXJrZXRfaWRgIC0gVGhlIG1hcmtldCBpZGVudGlmaWVyCiogYGlzX2xvbmdgIC0gVHJ1ZSBpZiBsb25nIHBvc2l0aW9uLCBmYWxzZSBpZiBzaG9ydAoqIGBzaXplYCAtIFRoZSBzaXplIG9mIHRoZSBwb3NpdGlvbiB0byBvcGVuCgojIFJldHVybnMKClRydWUgaWYgcG9zaXRpb24gY2FuIGJlIG9wZW5lZCwgZmFsc2Ugb3RoZXJ3aXNlAAAAAAAAEWNhbl9vcGVuX3Bvc2l0aW9uAAAAAAAAAwAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAAAAAAHaXNfbG9uZwAAAAABAAAAAAAAAARzaXplAAAACwAAAAEAAAAB",
            "AAAAAAAAAJ5HZXQgdGhlIGN1cnJlbnQgb3BlbiBpbnRlcmVzdCBmb3IgYSBtYXJrZXQuCgojIEFyZ3VtZW50cwoKKiBgbWFya2V0X2lkYCAtIFRoZSBtYXJrZXQgaWRlbnRpZmllcgoKIyBSZXR1cm5zCgpUdXBsZSBvZiAobG9uZ19vcGVuX2ludGVyZXN0LCBzaG9ydF9vcGVuX2ludGVyZXN0KQAAAAAAEWdldF9vcGVuX2ludGVyZXN0AAAAAAAAAQAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAEAAAPtAAAAAgAAAAsAAAAL",
            "AAAAAAAAAIVVcGRhdGUgdGhlIGZ1bmRpbmcgcmF0ZSBmb3IgYSBtYXJrZXQuCgpDYWxsZWQgZXZlcnkgNjAgc2Vjb25kcyBieSB0aGUga2VlcGVyIGJvdC4KCiMgQXJndW1lbnRzCgoqIGBtYXJrZXRfaWRgIC0gVGhlIG1hcmtldCBpZGVudGlmaWVyAAAAAAAAE3VwZGF0ZV9mdW5kaW5nX3JhdGUAAAAAAQAAAAAAAAAJbWFya2V0X2lkAAAAAAAABAAAAAA=",
            "AAAAAAAAAPVVcGRhdGUgb3BlbiBpbnRlcmVzdCB3aGVuIHBvc2l0aW9ucyBhcmUgb3BlbmVkIG9yIGNsb3NlZC4KCiMgQXJndW1lbnRzCgoqIGBtYXJrZXRfaWRgIC0gVGhlIG1hcmtldCBpZGVudGlmaWVyCiogYGlzX2xvbmdgIC0gVHJ1ZSBpZiBsb25nIHBvc2l0aW9uLCBmYWxzZSBpZiBzaG9ydAoqIGBzaXplX2RlbHRhYCAtIENoYW5nZSBpbiBwb3NpdGlvbiBzaXplIChwb3NpdGl2ZSA9IGluY3JlYXNlLCBuZWdhdGl2ZSA9IGRlY3JlYXNlKQAAAAAAABR1cGRhdGVfb3Blbl9pbnRlcmVzdAAAAAMAAAAAAAAACW1hcmtldF9pZAAAAAAAAAQAAAAAAAAAB2lzX2xvbmcAAAAAAQAAAAAAAAAKc2l6ZV9kZWx0YQAAAAAACwAAAAA="]), options);
        this.options = options;
    }
    fromJSON = {
        pause_market: (this.txFromJSON),
        create_market: (this.txFromJSON),
        unpause_market: (this.txFromJSON),
        get_funding_rate: (this.txFromJSON),
        is_market_paused: (this.txFromJSON),
        can_open_position: (this.txFromJSON),
        get_open_interest: (this.txFromJSON),
        update_funding_rate: (this.txFromJSON),
        update_open_interest: (this.txFromJSON)
    };
}
