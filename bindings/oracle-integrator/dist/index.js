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
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAQAAAAAAAAAAAAAADUNvbmZpZ01hbmFnZXIAAAA=",
            "AAAAAAAAAYhHZXQgdGhlIGN1cnJlbnQgcHJpY2UgZm9yIGEgc3BlY2lmaWMgYXNzZXQgZnJvbSBhbGwgb3JhY2xlIHNvdXJjZXMuCgojIEFyZ3VtZW50cwoKKiBgYXNzZXRfaWRgIC0gVGhlIGFzc2V0IGlkZW50aWZpZXIgKGUuZy4sICJYTE0iLCAiQlRDIiwgIkVUSCIpCgojIFJldHVybnMKClRoZSBhZ2dyZWdhdGVkIChtZWRpYW4pIHByaWNlIHdpdGggY29uZmlkZW5jZSBpbmRpY2F0b3IKCiMgTVZQIEltcGxlbWVudGF0aW9uCgpSZXR1cm5zIGEgZml4ZWQgbW9jayBwcmljZSBvZiAxMDBfMDAwXzAwMCAocmVwcmVzZW50aW5nICQxLjAwIHdpdGggNyBkZWNpbWFscykuClRoaXMgZW5zdXJlcyBjb25zaXN0ZW50IHByaWNpbmcgZm9yIE1WUCB0ZXN0aW5nIHdpdGhvdXQgcHJpY2UgZmx1Y3R1YXRpb25zLgAAAAlnZXRfcHJpY2UAAAAAAAABAAAAAAAAAAhhc3NldF9pZAAAAAQAAAABAAAACw==",
            "AAAAAAAAAHJJbml0aWFsaXplIHRoZSBPcmFjbGVJbnRlZ3JhdG9yIGNvbnRyYWN0LgoKIyBBcmd1bWVudHMKCiogYGNvbmZpZ19tYW5hZ2VyYCAtIEFkZHJlc3Mgb2YgdGhlIENvbmZpZ01hbmFnZXIgY29udHJhY3QAAAAAAAppbml0aWFsaXplAAAAAAABAAAAAAAAAA5jb25maWdfbWFuYWdlcgAAAAAAEwAAAAA=",
            "AAAAAAAAAQlWYWxpZGF0ZSBhIHByaWNlIGZlZWQgZm9yIHN0YWxlbmVzcyBhbmQgYm91bmRzLgoKIyBBcmd1bWVudHMKCiogYHByaWNlYCAtIFRoZSBwcmljZSB0byB2YWxpZGF0ZQoqIGB0aW1lc3RhbXBgIC0gVGhlIHByaWNlIHRpbWVzdGFtcAoqIGBtaW5fcHJpY2VgIC0gTWluaW11bSBhY2NlcHRhYmxlIHByaWNlCiogYG1heF9wcmljZWAgLSBNYXhpbXVtIGFjY2VwdGFibGUgcHJpY2UKCiMgUmV0dXJucwoKVHJ1ZSBpZiBwcmljZSBpcyB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlAAAAAAAADnZhbGlkYXRlX3ByaWNlAAAAAAAEAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAAAAAAACW1pbl9wcmljZQAAAAAAAAsAAAAAAAAACW1heF9wcmljZQAAAAAAAAsAAAABAAAAAQ==",
            "AAAAAAAAAHZGZXRjaCBwcmljZSBmcm9tIERJQSBvcmFjbGUuCgojIEFyZ3VtZW50cwoKKiBgYXNzZXRfaWRgIC0gVGhlIGFzc2V0IGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVHVwbGUgb2YgKHByaWNlLCB0aW1lc3RhbXApAAAAAAAPZmV0Y2hfZGlhX3ByaWNlAAAAAAEAAAAAAAAACGFzc2V0X2lkAAAABAAAAAEAAAPtAAAAAgAAAAsAAAAG",
            "AAAAAAAAAJNDYWxjdWxhdGUgbWVkaWFuIHByaWNlIGZyb20gbXVsdGlwbGUgb3JhY2xlIHNvdXJjZXMuCgojIEFyZ3VtZW50cwoKKiBgcHJpY2VzYCAtIEFycmF5IG9mIHByaWNlcyBmcm9tIGRpZmZlcmVudCBvcmFjbGVzCgojIFJldHVybnMKClRoZSBtZWRpYW4gcHJpY2UAAAAAEGNhbGN1bGF0ZV9tZWRpYW4AAAAAAAAAAQAAAAs=",
            "AAAAAAAAAItGZXRjaCBwcmljZSBmcm9tIFB5dGggTmV0d29yayBvcmFjbGUuCgojIEFyZ3VtZW50cwoKKiBgYXNzZXRfaWRgIC0gVGhlIGFzc2V0IGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVHVwbGUgb2YgKHByaWNlLCBjb25maWRlbmNlLCB0aW1lc3RhbXApAAAAABBmZXRjaF9weXRoX3ByaWNlAAAAAQAAAAAAAAAIYXNzZXRfaWQAAAAEAAAAAQAAA+0AAAADAAAACwAAAAsAAAAG",
            "AAAAAAAAAHBHZXQgdGhlIGhlYWx0aCBzdGF0dXMgb2YgYWxsIG9yYWNsZSBzb3VyY2VzLgoKIyBSZXR1cm5zCgpUdXBsZSBvZiAocHl0aF9oZWFsdGh5LCBkaWFfaGVhbHRoeSwgcmVmbGVjdG9yX2hlYWx0aHkpAAAAEWdldF9vcmFjbGVfaGVhbHRoAAAAAAAAAAAAAAEAAAPtAAAAAwAAAAEAAAABAAAAAQ==",
            "AAAAAAAAAJVVcGRhdGUgdGhlIGNhY2hlZCBwcmljZSBmb3IgYW4gYXNzZXQuCgpDYWxsZWQgcGVyaW9kaWNhbGx5IGJ5IGtlZXBlciBib3RzIHRvIG1haW50YWluIGZyZXNoIHByaWNlcy4KCiMgQXJndW1lbnRzCgoqIGBhc3NldF9pZGAgLSBUaGUgYXNzZXQgaWRlbnRpZmllcgAAAAAAABN1cGRhdGVfY2FjaGVkX3ByaWNlAAAAAAEAAAAAAAAACGFzc2V0X2lkAAAABAAAAAA=",
            "AAAAAAAAAPtDaGVjayBpZiBwcmljZSBkZXZpYXRpb24gYmV0d2VlbiBzb3VyY2VzIGV4Y2VlZHMgdGhyZXNob2xkLgoKIyBBcmd1bWVudHMKCiogYHByaWNlc2AgLSBBcnJheSBvZiBwcmljZXMgZnJvbSBkaWZmZXJlbnQgb3JhY2xlcwoqIGB0aHJlc2hvbGRfYnBzYCAtIE1heGltdW0gYWxsb3dlZCBkZXZpYXRpb24gaW4gYmFzaXMgcG9pbnRzCgojIFJldHVybnMKClRydWUgaWYgZGV2aWF0aW9uIGlzIGFjY2VwdGFibGUsIGZhbHNlIGlmIGV4Y2Vzc2l2ZQAAAAAVY2hlY2tfcHJpY2VfZGV2aWF0aW9uAAAAAAAAAQAAAAAAAAANdGhyZXNob2xkX2JwcwAAAAAAAAQAAAABAAAAAQ==",
            "AAAAAAAAAHxGZXRjaCBwcmljZSBmcm9tIFJlZmxlY3RvciBvcmFjbGUuCgojIEFyZ3VtZW50cwoKKiBgYXNzZXRfaWRgIC0gVGhlIGFzc2V0IGlkZW50aWZpZXIKCiMgUmV0dXJucwoKVHVwbGUgb2YgKHByaWNlLCB0aW1lc3RhbXApAAAAFWZldGNoX3JlZmxlY3Rvcl9wcmljZQAAAAAAAAEAAAAAAAAACGFzc2V0X2lkAAAABAAAAAEAAAPtAAAAAgAAAAsAAAAG"]), options);
        this.options = options;
    }
    fromJSON = {
        get_price: (this.txFromJSON),
        initialize: (this.txFromJSON),
        validate_price: (this.txFromJSON),
        fetch_dia_price: (this.txFromJSON),
        calculate_median: (this.txFromJSON),
        fetch_pyth_price: (this.txFromJSON),
        get_oracle_health: (this.txFromJSON),
        update_cached_price: (this.txFromJSON),
        check_price_deviation: (this.txFromJSON),
        fetch_reflector_price: (this.txFromJSON)
    };
}
