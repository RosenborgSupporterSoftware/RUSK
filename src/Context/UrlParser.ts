import { RBKwebPageType } from "./RBKwebPageType";

/**
 * A simple utility class that receives an RBKweb URL and returns the appropriate RBKwebPageType enum value
 */

export class UrlParser {

    /** Parse a URL and return the correct RBKwebPageType value */
    ParsePageType(url: string): RBKwebPageType {

        if(url.length == 0)
            return RBKwebPageType.RBKweb_NON_RBKWEB_URL;
        
    }

}
