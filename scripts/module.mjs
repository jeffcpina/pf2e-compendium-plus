console.debug("PF2e System | PF2e Compendium Plus| Started "); 
export const modName = "PF2e Compendium Plus";
const mod = "pf2e-compendium-plus";
var _domParser = new WeakMap;
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
    value,
    configurable: !0
});
var __defProp2 = Object.defineProperty,
    __defNormalProp = __name((obj, key, value) => key in obj ? __defProp2(obj, key, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value
    }) : obj[key] = value, "__defNormalProp"),
    __name2 = __name((target, value) => __defProp2(target, "name", {
        value,
        configurable: !0
    }), "__name"),
    __publicField = __name((obj, key, value) => (__defNormalProp(obj, typeof key != "symbol" ? key + "" : key, value), value), "__publicField"),
    __accessCheck = __name((obj, member, msg) => {
        if (!member.has(obj)) throw TypeError("Cannot " + msg)
    }, "__accessCheck"),
    __privateGet = __name((obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj)), "__privateGet"),
    __privateAdd = __name(
            (obj, member, value) => {
                if (member.has(obj)) throw TypeError("Cannot add the same private member more than once");
                member instanceof WeakSet ? member.add(obj) : member.set(obj, value)
            }, 
            "__privateAdd"
    )
class CompendiumBrowserTab1 {
    constructor(browser) {
        __publicField(this, "browser"), __publicField(this, "indexData", []), __publicField(this, "isInitialized", !1), __publicField(this, "totalItemCount", 0), 
        __publicField(this, "scrollLimit", 100), __privateAdd(this, _domParser, new DOMParser), __publicField(this, "searchFields", []), 
        __publicField(this, "storeFields", []), this.browser = browser;
    }
    async renderResults(start) {
        if (!this.templatePath) throw ErrorPF2e(`Tab "${this.tabName}" has no valid template path.`);
        const indexData = this.getIndexData(start),
            liElements = [];
        for (const entry of indexData) {
            const htmlString = await renderTemplate(this.templatePath, {
                    entry,
                    filterData: this.filterData
                }),
                html = __privateGet(this, _domParser).parseFromString(htmlString, "text/html");
            liElements.push(html.body.firstElementChild)
        }
        return liElements
    }
}
class CompendiumBrowserHeritageTab extends CompendiumBrowserTab1{
    constructor(browser) {
        super(browser),
        __publicField(this, "tabName", "heritage"),
        __publicField(this, "filterData"),
        __publicField(this, "templatePath", `modules/${mod}/templates/compendium-browser/partials/heritage.hbs`),
        __publicField(this, "searchFields", ["name"]),
        __publicField(this, "storeFields", ["type", "name", "img", "uuid", "traits", "source"]),
        __publicField(this, "index", ["img", "system.heritageType.value", "system.traits.value", "system.source.value"]),
        this.filterData = this.prepareFilterData()
    }
    async loadData() {
        console.debug("PF2e System | Compendium Browser | Started loading heritages");
        const heritages = []
          , indexFields = ["img", "system.traits.value", "system.source.value", "system.ancestry.name"]
          , ancestries = new Set //added by jcp
          , sources = new Set;
        for await(const {pack, index} of this.browser.packLoader.loadPacks("Item", this.browser.loadedPacks("heritage"), indexFields)) {
            console.debug(`PF2e System | Compendium Browser | ${pack.metadata.label} - Loading`);
            for (const heritageData of index)
                
                if (heritageData.type === "heritage") {
                    if (heritageData.system.ancestry === undefined) heritageData.system.ancestry = {name: "Versatile"};
                    if (!this.hasAllIndexFields(heritageData, indexFields)) {
                        console.warn(`Heritage '${heritageData.name}' does not have all required data fields. Consider unselecting pack '${pack.metadata.label}' in the compendium browser settings.`);
                        continue
                    }
                    
                    const source = heritageData.system.source.value;
                    var ancestry = heritageData.system.ancestry.name;
                    ancestry = ancestry.toLowerCase();

                    ancestry && ancestries.add(ancestry), 
                    source && (sources.add(source),
                    heritageData.system.source.value = game.pf2e.system.sluggify(source)),
                    heritages.push({
                        type: heritageData.type,
                        name: heritageData.name,
                        img: heritageData.img,
                        uuid: `Compendium.${pack.collection}.${heritageData._id}`,
                        traits: heritageData.system.traits.value,
                        ancestry: ancestry,
                        source: source
                    })
                }   
        }
        this.indexData = heritages,
        this.filterData.checkboxes.ancestry.options = this.generateSourceCheckboxOptions(ancestries),
        this.filterData.checkboxes.source.options = this.generateSourceCheckboxOptions(sources),
        console.debug("PF2e System | Compendium Browser | Finished loading heritages")
    }
    filterIndexData(entry) {
        const {checkboxes, 
              // multiselects
        } = this.filterData;
        return !( 
                  checkboxes.ancestry.selected.length && 
                  !checkboxes.ancestry.selected.includes(entry.ancestry) 
        )
    }
    prepareFilterData() {
        return {
            checkboxes: {
                ancestry: {
                    isExpanded: !1,
                    label: "Ancestry",
                    options: {},
                    selected: []
                },
                source: {
                    isExpanded: !1,
                    label: "PF2E.BrowserFilterSource",
                    options: {},
                    selected: []
                }
            },
            order: {
                by: "name",
                direction: "asc",
                options: {
                    name: "PF2E.BrowserSortyByNameLabel"
                }
            },
            search: {
                text: ""
            }
        }
    }
}
class CompendiumBrowserDeityTab extends CompendiumBrowserTab1{
    constructor(browser) {
        super(browser),
        __publicField(this, "tabName", "deity"),
        __publicField(this, "filterData"),
        __publicField(this, "templatePath", `modules/${mod}/templates/compendium-browser/partials/deity.hbs`),
        __publicField(this, "searchFields", ["name"]),
        __publicField(this, "storeFields", ["type", "name", "img", "uuid", "traits", "source"]),
        __publicField(this, "index", ["img", "system.category", "system.source.value", "system.weapons", "system.domains"]),
        this.filterData = this.prepareFilterData()
    }
    async loadData() {
        console.debug("PF2e System | Compendium Browser | Started loading deities");
        const deities = []
          , indexFields = ["img", "system.category", "system.source.value", "system.alignment", "system.weapons", "system.domains"]
          , categories = new Set //added by jcp
          , sources = new Set, alignmentList = CONFIG.PF2E.alignments
        for await(const {pack, index} of this.browser.packLoader.loadPacks("Item", this.browser.loadedPacks("deity"), indexFields)) {
            console.debug(`PF2e System | Compendium Browser | ${pack.metadata.label} - Loading`);
            for (const deityData of index)
                if (deityData.type === "deity") {
                    if (!this.hasAllIndexFields(deityData, indexFields)) {
                        console.warn(`Deity '${deityData.name}' does not have all required data fields. Consider unselecting pack '${pack.metadata.label}' in the compendium browser settings.`);
                        continue
                    }
                    const source = deityData.system.source.value;
                    const category = deityData.system.category;
                    const alignment = game.i18n.localize(alignmentList[deityData.system.alignment.own])
                    
                    category && categories.add(category), 
                    source && (sources.add(source),

                    deityData.system.source.value = game.pf2e.system.sluggify(source)),
                    deities.push({
                        type: deityData.type,
                        name: deityData.name,
                        img: deityData.img,
                        uuid: `Compendium.${pack.collection}.${deityData._id}`,
                        category: category,
                        alignments: deityData.system.alignment.follower,
                        alignment: alignment,
                        weapons: deityData.system.weapons,
                        domains: deityData.system.domains.primary,
                        source: source
                    })
                }   
        }
        var domainList=[], newArray = Object.entries(CONFIG.PF2E.deityDomains);
        newArray.map((val,idx)=>{var key=val[0],label=val[1].label; domainList[key]=label})
          
        this.indexData = deities,
        //this.filterData.checkboxes.category.options = this.generateSourceCheckboxOptions(categories),
        this.filterData.checkboxes.source.options = this.generateSourceCheckboxOptions(sources),
        this.filterData.multiselects.alignments.options = this.generateMultiselectOptions(
            {...CONFIG.PF2E.alignments}
        ),
        this.filterData.multiselects.weapons.options = this.generateMultiselectOptions(
            {...CONFIG.PF2E.baseWeaponTypes}
        ),
        this.filterData.multiselects.domains.options = this.generateMultiselectOptions(
            {...domainList}
        ),
        console.debug("PF2e System | Compendium Browser | Finished loading deities")
    }
    filterIndexData(entry) { 
        const { 
              multiselects,
              checkboxes
        } = this.filterData;

        return !( 
                  //checkboxes.category.selected.length && !checkboxes.category.selected.includes(entry.alignment) 
                  !this.filterTraits(entry.alignments, multiselects.alignments.selected, multiselects.alignments.conjunction) 
                  || !this.filterTraits(entry.weapons, multiselects.weapons.selected, multiselects.weapons.conjunction) 
                  || !this.filterTraits(entry.domains, multiselects.domains.selected, multiselects.domains.conjunction) 
        )
    }
    prepareFilterData() {
        return {
            checkboxes: {
                source: {
                    isExpanded: !1,
                    label: "PF2E.BrowserFilterSource",
                    options: {},
                    selected: []
                }
            },
            multiselects: {
                alignments: {
                    conjunction: "or",
                    label: "PF2E.Item.Deity.FollowerAlignments",
                    options: [],
                    selected: []
                },
                weapons: {
                    conjunction: "or",
                    label: "PF2E.Item.Deity.FavoredWeapons.Label",
                    options: [],
                    selected: []
                },
                domains: {
                    conjunction: "or",
                    label: "Domains",
                    options: [],
                    selected: []
                }
            },
            order: {
                by: "name",
                direction: "asc",
                options: {
                    name: "PF2E.BrowserSortyByNameLabel"
                }
            },
            search: {
                text: ""
            }
        }
    }
}

/*** end of classes */

function attach_compendium_tab(compendium){
        //reset parent of Compendium with embedded CompendiumBrowserTab
        var gparent = Object.getPrototypeOf(Object.getPrototypeOf(compendium))
        var browser_parent = Object.getPrototypeOf(game.pf2e.compendiumBrowser.tabs.action);
        Object.setPrototypeOf(gparent, browser_parent); 
}
function setHeritage(app){
    if (! (app.dataTabsList.indexOf("heritage") >= 0) ) {
        var new_compendiumBrowser = new CompendiumBrowserHeritageTab(game.pf2e.compendiumBrowser);    
        attach_compendium_tab(new_compendiumBrowser)
        app.tabs["heritage"] = new_compendiumBrowser;
        app.settings.heritage = { "pf2e.heritages" : {
            load: true,
            name: "Heritage"
        }}
        app.dataTabsList.push("heritage");
    }   
}
function setDeity(app){
    if (! (app.dataTabsList.indexOf("deity") >= 0) ) {
        var new_compendiumBrowser = new CompendiumBrowserDeityTab(game.pf2e.compendiumBrowser);    
        attach_compendium_tab(new_compendiumBrowser)
        app.tabs["deity"] = new_compendiumBrowser;
        app.settings.deity = { "pf2e.deities" : {
            load: true,
            name: "Deity"
        }}
        app.dataTabsList.push("deity");
    }   
}
//==========================
// Hooks
//==========================

function changeDefaultTemplate(newTemplate){
    this.options.template = newTemplate;
    return this.options;
}
Hooks.on('pf2e.systemReady', async () => {
    var compendiumBrowser = game.pf2e.compendiumBrowser;
    compendiumBrowser.changeDefaultTemplate = changeDefaultTemplate;
    compendiumBrowser.changeDefaultTemplate(`modules/${mod}/templates/compendium-browser/compendium-browser.hbs`);
    setHeritage(compendiumBrowser)
    setDeity(compendiumBrowser)
}); 
Hooks.on('renderCompendiumBrowser', async (app, html, data) => {
    var el = html.find('.spell-browser').find('.control-area').find('.filtercontainer[data-filter-name="domains"]');
    var new_html = '<p>&nbsp</p><p><strong>Cleric bonus based on deity chosen:</strong></p><ul><li>Cloister Cleric get bonus spells with domain</li><li>War Priest gets bonuses with the favored weapon</li></ul>'
    el.after(new_html);

})

//todo
//add player core rules
//remove sections and menu on tutorial front sheet