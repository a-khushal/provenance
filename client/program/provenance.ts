/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/provenance.json`.
 */
export type Provenance = {
  "address": "A2KsJCvSpBGJjrzUoX8CHT7GrcnBV6F8p43QLopTpCtN",
  "metadata": {
    "name": "provenance",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "registerContent",
      "discriminator": [
        170,
        55,
        41,
        115,
        252,
        248,
        38,
        144
      ],
      "accounts": [
        {
          "name": "registration",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "promptHash"
              }
            ]
          }
        },
        {
          "name": "promptIndex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  109,
                  112,
                  116,
                  95,
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "arg",
                "path": "promptHash"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "promptHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "outputHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "verifyPrompt",
      "discriminator": [
        232,
        11,
        6,
        26,
        35,
        248,
        142,
        157
      ],
      "accounts": [
        {
          "name": "promptIndex",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  109,
                  112,
                  116,
                  95,
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "arg",
                "path": "promptHash"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "promptHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ],
      "returns": {
        "vec": "pubkey"
      }
    }
  ],
  "accounts": [
    {
      "name": "promptIndex",
      "discriminator": [
        67,
        102,
        174,
        217,
        33,
        247,
        7,
        159
      ]
    },
    {
      "name": "registration",
      "discriminator": [
        158,
        129,
        230,
        90,
        93,
        95,
        101,
        55
      ]
    }
  ],
  "events": [
    {
      "name": "contentRegistered",
      "discriminator": [
        234,
        59,
        220,
        137,
        21,
        89,
        2,
        148
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "promptNotFound",
      "msg": "No registration found for this prompt"
    }
  ],
  "types": [
    {
      "name": "contentRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "promptHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "outputHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "promptIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "promptHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "registrations",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "registration",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "promptHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "outputHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
