const intersect = function(arr1, arr2) {
    return arr1.filter(function(n) {
        return arr2.indexOf(n) !== -1;
    });
};

module.exports = intersect