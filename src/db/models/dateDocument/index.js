'use strict';

/**
 * Mongoose main document schema and model.
 * Model should be defined only for the main document.
 */

const mongoose = require('mongoose');
const { hooks, methods, toJSON } = require('./functions');

const dateSchema = mongoose.Schema(
  {
    date: {
      type: String
    },
    dateType: {
      type: String
    },
    mismatch: {
      type: Number,
      default: 0
    },
    users: [
      {
        did: {
          type: String
        },
        date: {
          type: String
        },
        dateType: {
          type: String
        },
        lid: {
          type: String
        },
        uid: {
          type: String
        },
        data: {
          status: {
            type: String
          },
          inTime: {
            type: String
          },
          outTime: {
            type: String
          },
          totalWorkTime: {
            type: String
          },
          actualWorkTime: {
            type: String
          },
          expectedWorkTime: {
            type: String
          },
          lineIntent: {
            type: String
          }
        }
      }
    ],
    metadata: {
      created: {
        type: Date,
        default: Date.now
      },
      updated: {
        type: Date,
        default: Date.now
      }
    }
  },
  { toJSON }
);

/**
 * Middlewares a.k.a. Hooks
 * Refer to mongoose document for more details.
 * Fat arrow notation cannot be used due to its lexical scope property.
 */
const preHooks = Object.keys(hooks.pre);
const postHooks = Object.keys(hooks.post);

preHooks.forEach(hook => {
  dateSchema.pre(hook, hooks.pre[hook]);
});
postHooks.forEach(hook => {
  dateSchema.post(hook, hooks.post[hook]);
});

/**
 * Custom methods for this schema.
 * Fat arrow notation cannot be used due to its lexical scope property.
 */
const customMethods = Object.keys(methods);
customMethods.forEach(method => {
  dateSchema.methods[method] = methods[method];
});

module.exports = mongoose.model('Dates', dateSchema);
