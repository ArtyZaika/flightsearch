flightsearch
============

Searching Flights Statistics

На стороне сервиса (веб) должна быть форма с полями

    IATA код аэропорта
    Типа расписания (вылет/прилет)
    Код авиакомпании (опционально)
    Для всех текстовых полей ввода формы предусмотреть autosuggest по первым буквам названия.


Запрос в FlightStats должен быть ассинхронным.

Первый запрос с клиента на сервер на парс возвращает ID запроса и AJAX-ом проверка статуса запроса раз в 2 секунды и вывод информации по факту готовности ответа. То есть на сервера должен быть модуль ключ/значение(ответ) - желательно в редисе.

Ответ выдать в вебе ниже формы в таблице.

Если код авиакомпании не задан, то на текущий период времени +/- 4 часа 

Формат

Destination (код) | Flight (с код-шерами - разобраться что это) | Airline | Departure Schedule/Actual | Gate | Status

Если код авиакомпании задан, то все рейсы на сегодня по этой АК (+/- 12 часов - сутки в центром на текущий период времени)

Формат

Date | Destination (код) | Flight (с код-шерами - разобраться что это) | Departure Schedule/Actual | Gate | Status
