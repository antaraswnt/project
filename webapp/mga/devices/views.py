from django.shortcuts import render
from django.http import HttpResponse
from models import *
import json

# Create your views here.
def register_device(request):
    if request.method == 'POST':
        device_uuid = request.POST.get('uuid', None)
        device_code = request.POST.get('code', None)
        device_type = request.POST.get('type', None)
        
        if device_type == 'Controller':
            if not device_code:
                return HttpResponse(json.dumps({'success': False, 'error': 'Invalid code.'}))

            devices = Device.objects.filter(device_code=device_code, device_type='Display')
            if devices.count() == 0:
                return HttpResponse(json.dumps({'success': False, 'error': 'No display for the code.'}))
            
            display = devices[0] # Display found for the code.

            if device_uuid:
                try:
                    device = Device.objects.get(uuid=device_uuid)
                except:
                    device = Device()

            device.code = device_code
            device.relay = display.relay
            device.save()
            return HttpResponse(json.dumps({'success': True, 'device': device.get_json()}))
        
        elif device_type == 'Display':
            if device_uuid:
                try:
                    device = Device.objects.get(uuid=device_uuid)
                except:
                    device = Device()
      
            device.device_type = 'Display'
            device.device_code = 'abc' # Assign a random code
            device.relay = Relay.objects.all()[0] # Assign a random relay
            device.save()
            return HttpResponse(json.dumps({'success': True, 'device': device.get_json()}))

    return HttpResponse(json.dumps({'success': True}))