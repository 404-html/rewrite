import collectionToHtml from '../utilities/collectionToHtml';
import htmlToCollection from '../utilities/htmlToCollection';
import unwrapColumns from '../utilities/unwrap';
import arrayToCollection from '../utilities/arrayToCollection';

let _collection;

class Parse {
    constructor(value = null, options = {}) {
        this.options = {
            flag: 'inactive',
            re: /^(\s+)?[>?!/]+(\s+)?/,
            unwrap: true, // unwrap hard breaks
            tag: 'p',
            br: '<br/>',
            markdown: false,
            filterInactive: true, // see toTextArray()
            ...options,
        };

        // cast the value as Object literal
        if (!value) value = '';

        if (value.data) {
            console.warn('Coersing data from Object');
            value = value.data;
        }

        const { re, unwrap, markdown } = this.options;

        const constructor = value.constructor;
        let type =
            (constructor === Object && 'object') ||
            (constructor === String && 'string') ||
            (constructor === Array && 'array') ||
            (constructor === HTMLCollection && 'html') ||
            'unknown';

        if (type === 'object' && value.data) {
            console.warn('Coerse data array');
            type = 'array';
            value = value.data;
        }

        // determine input value and parse as
        // collection schema
        switch (type) {
            case 'string':
                // this is a MD of txt file convert it to collection
                //? permit fountain screenplay detection

                value = linebreaks(value);
                value = unwrap ? unwrapColumns(value) : value.split(/\n/g);
                value = arrayToCollection(value, re, markdown);
                break;

            case 'array':
                // this can be either a simple text array
                // or a previously fromatted collection (eg. from disk)
                value = arrayToCollection(value, re, markdown);
                break;

            case 'html':
                // this is a collection of HTML nodes
                value = htmlToCollection(value);
                break;

            default:
                console.error(
                    'WARNING! switch fallthrough for',
                    type,
                    constructor,
                    value
                );
                break;
        }
        // assign to private value
        _collection = [...value];
    }

    toHTML() {
        const { options } = this;
        return collectionToHtml.call(this, _collection, options);
    }

    toText() {
        const array = toTextArray(_collection, this.options);
        let string = array.join('\n');
        string = string.replace(/(\s+)?$/g, '');

        return string;
    }

    toArray() {
        return toTextArray(_collection, this.options);
    }

    toCollection() {
        return _collection;
    }
}

export default Parse;

function toTextArray(collection, options) {
    // retrun simple Array of paragraph Strings
    // @collection = schema object

    const { filterInactive = false } = options;

    return [...collection]
        .map(o => (filterInactive ? getOutputText(o) : `${o.text}`))
        .filter(s => s !== null);
}

function linebreaks(plaintext = '') {
    // remove carridge returns (aka CrLf => Lf)
    if (/\r/.test(plaintext)) plaintext = plaintext.replace(/\r/gm, '');
    return plaintext;
}

function getOutputText(object) {
    // @object = line Object
    // returns String or null (if the ignore pattern is matched)
    // lines with the value (empty)
    // lines with inactive flag

    if (object.inactive || object.empty) return null;
    if (/\(empty\)/.test(object.text)) return null;
    return `${object.text}`;
}
