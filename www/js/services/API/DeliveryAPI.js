angular.module('shopmycourse.services')

.service('DeliveryAPI', function (API, Configuration) {

    var resource = API(Configuration.apiEndpoint + 'deliveries', { idDelivery: '@idDelivery' },
    {
        'deliveries': { method: 'GET', url: Configuration.apiEndpoint + 'deliveries/deliveries.json', cache: false, isArray: true },
        'orders': { method: 'GET', url: Configuration.apiEndpoint + 'deliveries/orders.json', cache: false, isArray: true }
    });

    return resource;
});
