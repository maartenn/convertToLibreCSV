$(function(){
	
	// Event listeners
	$('#inputFile').change(function(e) {
		hideErrors();
		readSingleFile(e);
	});

	$("#btnConvert").click(function() {
		let text = $('#textInput').val().trim();
		$('#outputContainer').hide();
		hideErrors();

		if(text.length>1){
			try{
				let data = JSON.parse(text);
				convertFile(data);

			} catch (e) {
				$('#sectionInvalidJson').show();	
				scrollToBottom();
			}
		}
		else { 
			$('#sectionNoData').show();	
			scrollToBottom();
		}
	});

	$("#btnCopyClipboard").click(function(){
		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val($('#textOutput').val()).select();
		document.execCommand("copy");
		$temp.remove();
	});
	
	$("#btnDownload").click(function(){
		downloadOutput();
	});
	
	// functions 
	
	function readSingleFile(e) {
		var file = e.target.files[0];
		if (!file) {
		  return;
		}
		var reader = new FileReader();
		reader.onload = function(e) {
		  var contents = e.target.result;
		  $('#textInput').val(contents);
		  $('#textInput').show();
		};
		reader.readAsText(file);
	}

	function convertFile(data){	
		hideErrors();	
		var newArray = [];
		const nowFormatted = formatDateToStringUTC(new Date(new Date().getTime())); 
		newArray.push(`Glucosegegevens,Gegenereerd op,${nowFormatted} UTC,Gegenereerd door,Parser`);
		newArray.push(`Apparaat,Serienummer,Tijdstempel apparaat,Gegevenstype,Historische glucose mmol/l,Scan Glucose mmol/l,Niet-numerieke snelwerkende insuline,Snelwerkende insuline (eenheden),Niet-numeriek voedsel,Koolhydraten (gram),Koolhydraten (porties),Niet-numerieke langwerkende insuline,Langwerkende insuline (eenheden),Notities,Strip Glucose mmol/l,Keton mmol/l,Maaltijdinsuline (eenheden),Correctie insuline (eenheden),Wijzigen insuline gebruiker (eenheden)`);
		
		for(var i = data.length-1; i>0;i--) {
			if (data[i].value!=null){
				try {
					const glucosemmol = data[i].value.toFixed(1).toString().replace(/\./g, ',');
					
					const datetime = new Date(data[i].deviceTime);
					const formattedDatetime = formatDateToStringLocalZone(datetime);
					const line = `Freestyle Librelink,1dfda99d-dbdd-4d2e-a88b-6a56d5e29403,${formattedDatetime},0,"${glucosemmol}",,,,,,,,,,,,,,`;
					
					newArray.push(line);		
				}		
				catch(e) {
					$('#sectionInvalidData').show();	
				}
			}
		}
		
		$('#textOutput').val(newArray.join("\r\n"));	
		$('#outputContainer').show();
		scrollToBottom();
	}

	function scrollToBottom(){
		$("html, body").animate({
			scrollTop: $(
			'html, body').get(0).scrollHeight
		}, 1000);
	}

	function prependZeroIfNecessary(value){
		return (value < 10 ? '0' : '') + value;
	}

	function formatDateToStringUTC(datetime){
		return formatDateToString(datetime.getUTCDate(), datetime.getUTCMonth()+1,  datetime.getUTCFullYear(), datetime.getUTCHours(), datetime.getMinutes());
	}

	function formatDateToStringLocalZone(datetime){
		return formatDateToString(datetime.getDate(), datetime.getMonth()+1,  datetime.getFullYear(), datetime.getHours(), datetime.getMinutes());
	}
	
	function formatDateToString(day,month,year,hours,minutes){
		const dayFormatted = prependZeroIfNecessary(day);
		const monthFormatted = prependZeroIfNecessary(month);
						
		const hoursFormatted = prependZeroIfNecessary(hours);
		const minutesFormatted = prependZeroIfNecessary(minutes);
		return `${dayFormatted}-${monthFormatted}-${year} ${hoursFormatted}:${minutesFormatted}`;
	}
	function downloadOutput(){
		const a = document.createElement('a');
		const file = new Blob([$("#textOutput").val()], {type: 'text/plain'});
		
		a.href= URL.createObjectURL(file);
		a.download = "LibreviewFormatCSV_" + new Date().toLocaleDateString() + ".csv";
		a.click();
		
		URL.revokeObjectURL(a.href);
	}
	function hideErrors(){
		$('#sectionNoData').hide();
		$('#sectionInvalidJson').hide();
		$('#sectionInvalidData').hide();
	}

	// init page
	$('#outputContainer').hide();
	hideErrors();

});