(function() {
    'use strict';

    angular.module('data-prep.services.utils')
        /**
         * @ngdoc object
         * @name data-prep.services.utils.service:apiUrl
         * @description The REST api base url
         */
        .constant('apiUrl', 'http://10.42.40.50:8888')
        /**
         * @ngdoc object
         * @name data-prep.services.utils.service:disableDebug
         * @description Application option. Disable debug mode (ex: in production) for performance
         */
        .constant('disableDebug', false);
})();
