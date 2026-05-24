import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _kAccessTokenKey = 'access_token';
const _kRefreshTokenKey = 'refresh_token';

class ApiClient {
  ApiClient({required String baseUrl}) : _baseUrl = baseUrl {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: _onRequest,
      onError: _onError,
    ));
  }

  final String _baseUrl;
  late final Dio _dio;
  final _storage = const FlutterSecureStorage();

  Dio get dio => _dio;

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _kAccessTokenKey, value: accessToken),
      _storage.write(key: _kRefreshTokenKey, value: refreshToken),
    ]);
  }

  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _kAccessTokenKey),
      _storage.delete(key: _kRefreshTokenKey),
    ]);
  }

  Future<String?> get accessToken => _storage.read(key: _kAccessTokenKey);
  Future<String?> get refreshToken => _storage.read(key: _kRefreshTokenKey);

  // ── interceptors ────────────────────────────────────────────────────────

  Future<void> _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.read(key: _kAccessTokenKey);
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  Future<void> _onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }

    final refresh = await _storage.read(key: _kRefreshTokenKey);
    if (refresh == null) return handler.next(err);

    try {
      final res = await Dio().post(
        '$_baseUrl/v1/auth/refresh',
        data: {'refreshToken': refresh},
      );
      final newAccess = res.data['accessToken'] as String;
      final newRefresh = res.data['refreshToken'] as String;
      await saveTokens(accessToken: newAccess, refreshToken: newRefresh);

      err.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
      final retried = await _dio.fetch<dynamic>(err.requestOptions);
      return handler.resolve(retried);
    } catch (_) {
      await clearTokens();
      return handler.next(err);
    }
  }
}

final apiClientProvider = Provider<ApiClient>((ref) {
  // TODO: move base URL to env / flutter_dotenv
  const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3001',
  );
  return ApiClient(baseUrl: baseUrl);
});
