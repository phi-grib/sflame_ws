//     Description    Flame Search JavaScript 
//
//     Authors:       Manuel Pastor (manuel.pastor@upf.edu)
// 
//     Copyright 2018 Manuel Pastor
// 
//     This file is part of Flame
// 
//     Flame is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation version 3.
// 
//     Flame is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with Flame. If not, see <http://www.gnu.org/licenses/>.


// sort keys to order columns in a logical way
function sortKeys(myjson) {

    // select keys and order logically
    //  1. obj_name
    //  2. SMILES (if present at all)
    //  3. main results (one or many)

    // 1. obj_name
    var key_list = ['obj_nam'];

    // 2. SMILES
    if (myjson.hasOwnProperty('SMILES')) {
        key_list.push('SMILES');
    }

    // 3. main results
    var main = myjson['meta']['main'];
    key_list = key_list.concat(main);

    // special keys, already processed (obj_nam, SMILES and main[])
    // or never shown in a table (origin and meta)
    const black_list = key_list.concat(['origin', 'meta', 'manifest', 'obj_num', 'warning','external-validation']);

    for (var key in myjson) {
        if (!black_list.includes(key)) {
            key_list.push(key);
        }
    }

    return key_list;
}


// parse results obtained from the similarity search
function parseResults(results) {
   
    $("#data-console").text('search OK');
    // $("#data-json").text(results);
    $("#data-json").prop('hidden', false);
    lastResults = results;

    try {
        var myjson = JSON.parse(results);
    } catch (e) {
        $("#processing").prop('hidden', true);
        alert('ERROR: ' + results); // error in the above string (in this case, yes)!
        return;
    }

    if (("error" in myjson) != false) {
        $("#processing").prop('hidden', true);
        alert(myjson['error']); // show error as alert and return
        return;
    }

    if (("warning" in myjson) != false) {
        $("#processing").prop('hidden', true);
        alert(myjson['warning']); // show warning but do not return
    }

    // console.log(myjson);
    // console.log(myjson['search_results']);
    // var mainv = myjson['meta']['main'][0];
    // var manifest = myjson['manifest'];

    // key_list = sortKeys(myjson);

    // compile keys to render as chemical structures
    // var chem_list = [];
    // for (var item in manifest) {
    //     if (manifest[item]['type'] == 'smiles') {
    //         chem_list.push(manifest[item]['key']);
    //     }
    // }

  
   
    // header
    var tbl_body = '<thead><tr><th>Index</th>';
    descqname = 'Query column name from query test set';
    descqmol = 'Query molecule from query test set';
    dessim = 'Similarity distance score: Tanimoto for binary descriptors and Euclidean for continues ones';
    desrname = 'Reference column name from Reference training set';
    desrmol = 'Reference molecule column from Reference training set';

    tbl_body += '<th class="cssToolTip">Query name<span>' + descqname + '</span></th>';
    tbl_body += '<th class="cssToolTip">Reference name<span>' + desrname + '</span></th>';
    tbl_body += '<th class="cssToolTip">Query molecule<span>' + descqmol + '</span></th>';
    tbl_body += '<th class="cssToolTip">Reference molecule<span>' + desrmol + '</span></th>';
    tbl_body += '<th class="cssToolTip">Similarity<span>' + dessim + '</span></th>';



    // tbl_body += '<th class="cssToolTip">source_name<span>description</span></th>';
    // tbl_body += '<th class="cssToolTip">source_molecule<span>description</span></th>';
    // tbl_body += '<th class="cssToolTip">similarity<span>description</span></th>';
    // tbl_body += '<th class="cssToolTip">query_name<span>description</span></th>';
    // tbl_body += '<th class="cssToolTip">query_molecule<span>description</span></th>';

    // body
    tbl_body += '</tr></thead>';
    var val;
    var val_float;

    for (var i in  myjson['SMILES']) {

      

        aux =  myjson['search_results'][i];
        for (var j in aux['SMILES']) {
            tbl_body += "<tr><td width=>" + (+i + 1) + " - " + (+j + 1) + "</td>";

            tbl_body+="<td>" +myjson['obj_nam'][i]+ "</td>";
            tbl_body+="<td>" +aux['names'][j]+ "</td>";

            tbl_body+="<td><canvas id='query_"+(+i + 1) + "_" + (+j + 1)+"' >" +myjson['SMILES'][i]+ "</canvas></td>"; 
            tbl_body+="<td><canvas id='ref_"+(+i + 1) + "_" + (+j + 1)+"'>" +aux['SMILES'][j]+ "</canvas></td>";
            tbl_body+="<td>" +(aux['distances'][j]).toFixed(2)+ "</td>";

          
            //tbl_body += "</td><td>" + val_float.toFixed(3);
            tbl_body += "</tr>";

        }
       
    }

    $("#data-table").html(tbl_body);


    // SMILES must be inserted after the canvases were already created in included in the HTML code
    //if (key_list.includes('SMILES')){
    let smilesDrawer = new SmilesDrawer.Drawer({ 'width': 300, 'height': 150 });
    $("canvas").each(function(){
        var id = $(this).attr('id')
        var smiles = $(this).text();
        SmilesDrawer.parse(smiles, function (tree) {
            smilesDrawer.draw(tree,id, 'light', false);
        });
    });

    // now we can export the results
    $("#export").prop('disabled', false);
    $("#processing").prop('hidden', true);
};


// POST a similarity search request for the selected space, version and input file
function postSearch(temp_dir, ifile) {
    // collect all data for the post and insert into postData object
    var version = $("#version option:selected").text();

    if (version == 'dev') {
        version = '0';
    };

    $.post('/search', {
        "ifile": ifile,
        "space": $("#space option:selected").text(),
        "version": version,
        "temp_dir": temp_dir
    })
        .done(function (results) {
            lastResults = results;
            parseResults(results)
        });

};


// simple utility function to download as a file text generated here (client-side)
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
/**
 * @summary. Load both combos
 * @description. Load space and version combo calling the server, if a param is passes the space is selected by default
 * @param {string} selected="" the space to be selected 
 * @param {string} selectedVersion="" the version to be selected
 */
function loadCombos(selected = "", selectedVersion= "") {
    $.get('/dir')
        .done(function (results) {

            spaces = JSON.parse(results);
            var space_select = $("#space")[0];

            for (space in spaces) {
                if (spaces[space]["text"] == selected.toString()) {
                    space_select.options[space] = new Option(spaces[space]["text"], +space + 1, false, true);
                } else {
                    space_select.options[space] = new Option(spaces[space]["text"], +space + 1);
                }

            }

            var var_select = $("#version")[0];
            vspace = spaces[0]["nodes"];
            for (vj in vspace) {
                var_select.options[vj] = new Option(vspace[vj]["text"], +vj + 1);
            }
            $("#space").prop("selected", function (i, selected) {
                $("#version").empty();
                var var_select = $("#version")[0];
                for (vi in spaces) {
                    if (spaces[vi]["text"] == $("#space option:selected").text()) {
                        for (counter in spaces[vi]["nodes"]) {
                            versionToShow = Object.values(spaces[vi]["nodes"]);
                            if (versionToShow[counter]["text"]== selectedVersion){
                                var_select.options[counter] = new Option(versionToShow[counter]["text"], +counter + 1, false, true);    
                            }else{
                                var_select.options[counter] = new Option(versionToShow[counter]["text"], +counter + 1);
                            }
                            
                        }
                        return;
                    }
                }
            });
        });
    versionChangerHandler();
}

function versionChangerHandler() {
    // define available versions for this endpoint
    $("#space").on('change', function (e) {
        var versionToShow;
        $("#version").empty();
        var var_select = $("#version")[0];
        for (vi in spaces) {
            if (spaces[vi]["text"] == $("#space option:selected").text()) {
                for (counter in spaces[vi]["nodes"]) {
                    versionToShow = Object.values(spaces[vi]["nodes"]);
                    var_select.options[counter] = new Option(versionToShow[counter]["text"], +counter + 1);
                }
                return;
            }
        }
    });
}


// main
$(document).ready(function () {
    loadCombos();
    //versionChanger();
    // no similarity search so far
    lastResults = null;

    // initialize button status to disabled on reload
    $("#search").prop('disabled', true);
    $("#export").prop('disabled', true);

    // show file value after file select 
    $("#ifile").on('change', function () {
        file = document.getElementById("ifile").files[0];
        $("#ifile-label").html(file.name);
        $("#search").prop('disabled', false);
    })

    var versions; // object where space name and versions are stored

    // ask the server about available spaces and versions


    // "search" button
    $("#search").click(function (e) {

        // make sure the browser can upload XMLHTTP requests
        if (!window.XMLHttpRequest) {
            $("#data-console").text("this browser does not support file upload");
            return;
        };
        $("#processing").prop('hidden', false);

        // clear GUI
        $("#data-console").text('processing... please wait');
        $("#data-table").html('');
        $("#data-json").prop('hidden', true);

        $("#export").prop('disabled', true);

        // get the file 
        var ifile = document.getElementById("ifile").files[0];

        // generate a random dir name
        var temp_dir = randomDir();

        // call postSearch when file upload is completed
        if (upload(ifile, temp_dir, postSearch) == false) {
            $("#data-console").text("unable to upload file, similarity search aborted...");
            return;
        };

        e.preventDefault(); // from similarity serach click function
    });

    $("#export").click(function (e) {

        if (lastResults == null)
            return;

        var myjson = JSON.parse(lastResults);
        var tsv = '';



        // header

        tsv  = 'Index\tquery_name\treference_name\tquery_smiles\treference_smiles\tsimilarity\n';
        
        // body

        for (var i in  myjson['SMILES']) {

            aux =  myjson['search_results'][i];
            for (var j in aux['SMILES']) {
                sid = (+i + 1) + " - " + (+j + 1)
                qname = myjson['obj_nam'][i]
                qsmi = myjson['SMILES'][i]
                sim = (aux['distances'][j]).toFixed(3)
                rname = aux['names'][j]
                rsmi = aux['SMILES'][j]

                tsv += sid +"\t"+qname+'\t'+rname+'\t'+qsmi+'\t'+rsmi+'\t'+sim+'\n'

            }
        
        }

        download("similarity_results.tsv", tsv);

        e.preventDefault(); // from search click function
    });

});